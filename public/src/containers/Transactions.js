import React from 'react';
import { connect } from "react-redux";
import { Table } from "semantic-ui-react";

export function Transactions({ transactions }) {
  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell>Merchant</Table.HeaderCell>
          <Table.HeaderCell>Reference</Table.HeaderCell>
          <Table.HeaderCell>Amount</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {transactions.map(transaction => (
          <Table.Row key={transaction.id} positive={transaction.authorized} negative={!transaction.authorized}>
            <Table.Cell>{transaction.id}</Table.Cell>
            <Table.Cell>{transaction.date}</Table.Cell>
            <Table.Cell>{transaction.merchant}</Table.Cell>
            <Table.Cell>{transaction.description}</Table.Cell>
            <Table.Cell>R {(new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'ZAR' }).format(transaction.amount/100)).replace('ZAR', '')}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );

}

const mapStateToProps = (state) => ({
  transactions: state.transactions,
})

Transactions = connect(
  mapStateToProps,
  null
)(Transactions)

export default Transactions;
