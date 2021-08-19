import React from 'react';
import BridgeManager from "../lib/BridgeManager.js";
var QRCode = require('qrcode.react');
import Util from "../lib/Util.js"

export default class InstalledMFA extends React.Component {

  constructor(props) {
    super(props);
    setInterval(() => {
      var epoch = Math.round(new Date().getTime() / 1000.0);
      var countDown = 30 - (epoch % 30);
      if (epoch % 30 == 0) this.forceUpdate();
    }, 100);
  }

  uninstall = () => {
    BridgeManager.get().uninstallMfa(this.props.mfa);
  }

  render() {
    var secret = this.props.mfa.content.secret;
    var url = Util.generateQrCodeUrl(secret);
    var otp = Util.getOtp(secret);
    return [
      <div className="sk-panel-section no-border no-bottom-pad">
        <div className="sk-p">
          2FA is enabled. You can disable 2FA by pressing Disable below.
        </div>
      </div>,
      <div className="sk-panel-section">
        <div className="sk-panel-row sk-panel-section-outer-title">Two-factor Authentication</div>
        <div className="sk-panel-row justify-left align-top">

          <div className="sk-panel-column">
            <QRCode value={url}/>
            <div className="sk-panel-row sk-button-group stretch">
              <div className="sk-button danger" onClick={this.uninstall}>
                <div className="sk-label">Disable</div>
              </div>
            </div>
          </div>

          <div className="sk-panel-column right-section">

            <div className="sk-panel-row justify-left multi-label">
              Secret Key
              <span className="info sk-bold">{secret}</span>
            </div>
            <div className="sk-panel-row justify-left multi-label">
              Current Token
              <span className="info sk-bold">{otp}</span>
            </div>

          </div>
        </div>
      </div>
    ]
  }

}
