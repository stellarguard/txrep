import * as React from 'react';

import { TextField, Typography, withStyles } from '@material-ui/core';
import { Networks } from 'stellar-sdk';

import {
  toTransaction
} from '../src';

const styles = {};

class ToTransactionPage extends React.Component<any, any> {
  public state = { xdr: '', txrep: '', error: ''};
  public render() {
    const { classes } = this.props;
    const { xdr, txrep, error } = this.state;

    return (
      <div>
        <Typography variant="h3" component="h1">Txrep to Transaction</Typography>
        <form className={classes.form} noValidate autoComplete="off" name="uri">
          <div>
            <TextField
              name="txrep"
              label="Enter a SEP-11 Txrep"
              error={!!error}
              helperText={error}
              fullWidth
              margin="normal"
              onChange={this.onTxrepChange}
              multiline
              value={txrep || ''}
            />
          </div>
          <div>
            <TextField
              InputProps={{
                readOnly: true,
              }}
              label="Transaction XDR"
              margin="normal"
              multiline
              fullWidth
              value={xdr}
              variant="filled"
            />
            {!error && xdr ? <div><a href={`https://www.stellar.org/laboratory/#xdr-viewer?input=${encodeURIComponent(xdr)}`} target="_blank _noreferrer">View in Stellar Laboratory</a></div> : null}
          </div>
        </form>
      </div>
    );
  }

  private onTxrepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const txrep = event.target.value || '';
    if(!txrep) {
      this.setState({txrep, error: '', xdr: ''});
      return;
    }

    try {
      const tx = toTransaction(txrep, Networks.TESTNET);
      const xdr = tx.toEnvelope().toXDR('base64');
      this.setState({txrep, xdr, error: ''});
    } catch(e) {
      const error = 'Error converting to transaction: ' + e;
      this.setState({txrep, error});
      // tslint:disable-next-line:no-console
      console.error(e);
    }
  };
}

export default withStyles(styles)(ToTransactionPage);
