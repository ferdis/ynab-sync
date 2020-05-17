from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.staticfiles import StaticFiles
from starlette.responses import FileResponse, JSONResponse
from starlette.config import Config
from starlette.background import BackgroundTask
from starlette.middleware.cors import CORSMiddleware
import uvicorn
import databases
import sqlalchemy
import logging
import dateutil.parser
import random
import ynab_api as ynab


# Configuration from environment variables or '.env' file.
config = Config('.env')

ynab_config =  ynab.configuration.Configuration()
ynab_config.api_key['Authorization'] = config('YNAB_TOKEN')
ynab_config.api_key_prefix['Authorization'] = 'Bearer'

ynab_client = ynab.api_client.ApiClient(ynab_config)

DATABASE_URL = config('DATABASE_URL')
metadata = sqlalchemy.MetaData()

transactions = sqlalchemy.Table(
    "transactions",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("date", sqlalchemy.DateTime),
    sqlalchemy.Column("authorized", sqlalchemy.Boolean),
    sqlalchemy.Column("amount", sqlalchemy.Integer),
    sqlalchemy.Column("card", sqlalchemy.String),
    sqlalchemy.Column("description", sqlalchemy.String),
    sqlalchemy.Column("merchant", sqlalchemy.String),
)

database = databases.Database(DATABASE_URL)

app = Starlette(
    debug=True,
    on_shutdown=[database.disconnect],
    on_startup=[database.connect],
    middleware=[Middleware(CORSMiddleware, allow_origins=['*'])],
)

def create_ynab_transaction(authorized, data):
    ynab.TransactionsApi(ynab_client).create_transaction(
        budget_id=config('YNAB_BUDGET_ID'),
        data={
            'transaction': {
                'account_id': config('YNAB_ACCOUNT_ID'),
                'date': data['dateTime'],
                'amount': -1 * int(data['centsAmount']) * 10,
                'approved': authorized,
                'memo': data['reference'],
                'payee_name': data['merchant']['name'],
                'flag_color': 'blue',
                'cleared': 'cleared',
            }
        }
    )


@app.route('/api/transactions', methods=['GET'])
async def list_transactions(request):
    query = transactions.select()
    results = await database.fetch_all(query)
    content = {
        'transactions': [
            {
                'id': result['id'],
                'date': result['date'].strftime('%Y-%M-%D %H:%m:%s'),
                'authorized': result['authorized'],
                'amount': result['amount'],
                'card': result['card'],
                'description': result['description'],
                'merchant': result['merchant'],
            } for result in results
        ]
    }

    return JSONResponse(content)


@app.route('/api/transactions', methods=['POST'])
async def add_transactions(request):
    body = await request.json()
    authorized = True  # random.random() >= .5

    task = BackgroundTask(create_ynab_transaction, authorized=authorized, data=body)

    query = transactions.insert().values(
        date=dateutil.parser.isoparse(body['dateTime']),
        amount=body['centsAmount'],
        card=body['card']['id'],
        description=body['reference'],
        merchant=body['merchant']['name'],
        authorized=authorized,
    )

    await database.execute(query)

    content = {
        'success': authorized
    }

    return JSONResponse(content, background=task)


@app.route('/api/transactions/{id:int}', methods=['GET'])
async def list_transactions(request):
    transaction_id = request.path_params['id']
    query = transactions.select().where(id=transaction_id)
    result = await database.fetch_one(query)
    content = {
        'transaction': result
    }
    return JSONResponse(content)


@app.exception_handler(404)
async def not_found(request, exc):
    """
    Return an HTTP 404 page.
    """
    return FileResponse('/static/dist/index.html')


@app.exception_handler(500)
async def server_error(request, exc):
    """
    Return an HTTP 500 page.
    """
    return JSONResponse(exc, status_code=500)


app.mount('/', StaticFiles(directory='public/dist'))

if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=8000)
