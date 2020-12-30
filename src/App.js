import React, { Component } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import FilesUploadComponent from "./components/files-upload-component";

import { w3cwebsocket as W3CWebSocket } from "websocket";
const client = new W3CWebSocket("ws://127.0.0.1:8000");
class App extends Component {
  state = {
    logs: [],
  };
  componentWillMount() {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    client.onmessage = (message) => {
      const payload = JSON.parse(message.data)

      this.setState({logs: [...this.state.logs, `${new Date()}: ${payload.type} - ${payload.data}`]})
      console.log(message);
    };
  }

  render() {
    return (
      <div className="App">
        <FilesUploadComponent />
        LOGS:
        <ul>
          {this.state.logs.map((l) => (
            <li>{l}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
