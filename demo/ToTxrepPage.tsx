import * as React from 'react';

import { TextField, Typography, withStyles } from '@material-ui/core';
import { Networks, Transaction } from 'stellar-sdk';

import {
  toTxrep
} from '../src';

const styles = {};

class ToTxRepPage extends React.Component<any, any> {
  public state = { xdr: '', txrep: '', error: ''};
  public render() {
    const { classes } = this.props;
    const { xdr, txrep, error } = this.state;

    return (
      <div>
        <Typography variant="h3" component="h1">Transaction to Txrep</Typography>
        <form className={classes.form} noValidate autoComplete="off" name="uri">
          <div>
            <TextField
              name="xdr"
              label="Enter a base64 transaction XDR"
              error={!!error}
              helperText={error}
              fullWidth
              margin="normal"
              onChange={this.onXdrChange}
              multiline
              value={xdr}
            />
            {!error && xdr ? <div><a href={`https://www.stellar.org/laboratory/#xdr-viewer?input=${encodeURIComponent(xdr)}`} target="_blank _noreferrer">View in Stellar Laboratory</a></div> : null}
          </div>
          <TextField
            InputProps={{
              readOnly: true,
            }}
            label="Txrep"
            margin="normal"
            multiline
            fullWidth
            value={txrep}
            variant="filled"
          />
        </form>
      </div>
    );
  }

  private onXdrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const xdr = event.target.value || '';
    if(!xdr) {
      this.setState({xdr, error: '', txrep: ''});
      return;
    }

    try {
      const tx = new Transaction(xdr, Networks.TESTNET);

      try {
        const txrep = toTxrep(tx);
        this.setState({ xdr, txrep, error: '' });
      } catch(e) {
        const error = 'Error converting to txrep: ' + e;
        // tslint:disable-next-line:no-console
        console.error(e);
        this.setState({xdr, error});
      }

    } catch(e) {
      const error = 'Invalid Transaction XDR: ' + e;
      this.setState({xdr, error});
      // tslint:disable-next-line:no-console
      console.error(e);
    }
  };
}

export default withStyles(styles)(ToTxRepPage);
