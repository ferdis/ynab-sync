import React from 'react';
import { Container, Dimmer, Dropdown, Icon, Loader, Menu, } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import Transactions from "../containers/Transactions";
import { getTransactions } from "../actions";
import { connect } from "react-redux";


export function App({ getTransactions, loading }) {
  return (
    <div>
      <Menu fixed='top' inverted>
        <Container>
          <Menu.Item as='a' header>
            Transactions
          </Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item onClick={getTransactions}>
              <Icon name='refresh' loading={loading} />
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>
      <Container style={{ marginTop: '5em' }}>
        <div>
          <Transactions />
        </div>
      </Container>
    </div>
  );
}

const mapDispatchToProps = {
  getTransactions: getTransactions,
};

const mapStateToProps = (state) => ({
  loading: state.loading,
});

App = connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);

export default App;
