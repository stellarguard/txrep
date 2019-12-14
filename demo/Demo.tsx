import * as React from 'react';

import { AppBar, Tab, Tabs, withStyles } from '@material-ui/core';

import Theme from './Theme';
import ToTransactionPage from './ToTransactionPage';
import ToTxrepPage from './ToTxrepPage';

const styles = () => ({
  main: { padding: 24 }
});

class Demo extends React.Component<any, any> {
  public state = { value: 0 };

  public render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <Theme>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange}>
            <Tab label="To Txrep" />
            <Tab label="To Transaction" />
          </Tabs>
        </AppBar>
        <main className={classes.main}>
          {value === 0 && <ToTxrepPage />}
          {value === 1 && <ToTransactionPage />}
        </main>
      </Theme>
    );
  }

  private handleChange = (event, value) => {
    this.setState({ value });
  };
}

export default withStyles(styles)(Demo);
