import React from 'react';
import BridgeManager from "../lib/BridgeManager.js";
import Util from "../lib/Util.js"
import InstalledMFA from "./InstalledMFA.js";
import NewMFA from "./NewMFA.js";

export default class Home extends React.Component {

  constructor(props) {
    super(props);
    BridgeManager.get().initiateBridge();
    BridgeManager.get().addUpdateObserver(() => {
      var installed = BridgeManager.get().getInstalledMfa();
      if(installed) {
        this.setState({installedMfa: installed, secret: null});
      } else {
        this.setState({installedMfa: installed});
      }
    })

    this.state = {};
  }

  render() {
    var mfa = this.state.installedMfa;
    return (
      <div className="sk-panel static">
        <div className="sk-panel-content">
            {mfa &&
              <InstalledMFA mfa={mfa} />
            }

            {!mfa &&
              <NewMFA />
            }
          </div>
      </div>
    )
  }

}
