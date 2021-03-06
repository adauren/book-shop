import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import SignIn from "./user/SignIn";
import SignUp from "./user/SignUp";
import Home from "./core/Home";

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/signin" exact component={SignIn} />
        <Route path="/signup" exact component={SignUp} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
