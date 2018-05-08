import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';


let Router = DefaultRouter;


export default function() {
  return (
<Router history={window.g_history}>
  <Switch>

  </Switch>
</Router>
  );
}
