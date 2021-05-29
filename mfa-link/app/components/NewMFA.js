import React from 'react';
import BridgeManager from "../lib/BridgeManager.js";
import Util from "../lib/Util.js"
var QRCode = require('qrcode.react');

export default class NewMFA extends React.Component {

  constructor(props) {
    super(props);
    this.state = {secret: Util.generateSecretKey(), allowRecovery: true}
    setInterval(() => {
      var epoch = Math.round(new Date().getTime() / 1000.0);
      var countDown = 30 - (epoch % 30);
      if (epoch % 30 == 0) this.forceUpdate();
    }, 100);
  }

  install = () => {
    this.setState({confirm: true});
  }

  cancelConfirmation = () => {
    this.setState({confirm: false});
  }

  confirmInstall = () => {
    BridgeManager.get().installMfa(this.state.secret, this.state.allowRecovery);
  }

  handleKeyInputChange = (event) => {
    this.setState({confirmKey: event.target.value.trim()});
  }

  handleTokenInputChange = (event) => {
    this.setState({confirmToken: event.target.value.trim()});
  }

  submitConfirmationForm = (event) => {
    event.preventDefault();
    let matchesKey = this.state.confirmKey == this.state.secret;
    let matchesToken = Util.getOtp(this.state.secret) == this.state.confirmToken;

    if(!matchesKey) {
      alert("The Secret Key you entered is incorrect. Please try again.");
    } else if(!matchesToken) {
      alert("The Current Token you entered is incorrect. Please try again.");
    } else {
      // Install
      this.confirmInstall();
    }
  }

  toggleEmailRecovery = () => {
    this.setState({allowRecovery: !this.state.allowRecovery})
  }

  recoveryLearnMore = () => {
    this.setState({showRecoveryDetails: !this.state.showRecoveryDetails});
  }

  exportSecret = () => {
    Util.saveFile("standardnotes_2fa_key.txt", this.state.secret);
  }

  render() {
    var secret = this.state.secret;
    var url = Util.generateQrCodeUrl(secret);
    var otp = Util.getOtp(secret);
    return [

      (this.state.confirm &&
        <div className="sk-panel-section no-border no-bottom-pad">
          <div className="sk-panel-row">
            <div className="sk-panel-section-title">
              Confirm 2FA
            </div>
            <a onClick={this.cancelConfirmation} className="info">Cancel</a>
          </div>

          <div className="sk-panel-row">
            <div className="sk-p">
              Ensure you have stored your <strong>Secret Key</strong> somewhere safe. If you lose this key, you lose access to your account.
            </div>
          </div>

          <form className="sk-panel-row panel-form" onSubmit={this.submitConfirmationForm}>
            <div className="panel-column stretch">
              <input
                className="sk-input contrast"
                placeholder="Enter Secret Key"
                value={this.state.confirmKey}
                onChange={this.handleKeyInputChange}
              />
              <input
                className="sk-input contrast"
                placeholder="Enter Current Token"
                value={this.state.confirmToken}
                onChange={this.handleTokenInputChange}
              />

              <div className="sk-panel-row center justify-left">
                <label>
                  <input checked={this.state.allowRecovery} onChange={this.toggleEmailRecovery} type="checkbox" />
                  Allow email recovery
                </label>
              </div>

              <div className="sk-panel-row"/>

              <div className="sk-panel-row button-group stretch form-submit">
                <button className="sk-button info featured" type="submit">
                  <div className="sk-label">Install 2FA</div>
                </button>
              </div>

              <div className="sk-panel-row"/>

              <div className="sk-panel-section-outer-title sk-bold">
                Email Recovery
              </div>

              <div className="sk-panel-row" style={{paddingBottom: 14}}>
                <div className="panel-column">
                  <div className="sk-p">
                    If you lose access to your device and your secret key, you will be unable to login to your account.
                    If you enable Email Recovery, you can email Standard Notes from your account email to disable 2FA
                    and allow you to sign back in to your account.
                  </div>
                  <br/>
                  <div className="sk-p">
                    If you leave this option unchecked, you will permanently lose access to your account if you lose your secret key and do not have it backed up.
                    For power users who maintain good data safety practices, we recommend keeping this option <i>disabled</i> for optimum security.
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      ),

      (!this.state.confirm &&
        <div className="sk-panel-section no-border no-bottom-pad">
          <div className="sk-p">
            2FA is currently disabled. You can enable 2FA by accepting the code below and pressing Enable.
          </div>
        </div>
      ),

      (!this.state.confirm &&

        <div className="sk-panel-section">
            <div className="sk-panel-section-outer-title"><strong>Enable two-factor authentication</strong></div>

          <div className="sk-panel-row justify-left align-top">

            <div className="panel-column">
              <div className="white-border">
                <QRCode value={url}/>
              </div>
              <div className="sk-panel-row sk-button-group stretch">
                <div className="sk-button info" onClick={this.install}>
                  <div className="sk-label">Enable</div>
                </div>
              </div>
              <div className="sk-panel-row sk-button-group stretch">
                <div className="sk-button warning" onClick={this.exportSecret}>
                  <div className="sk-label">Export Secret</div>
                </div>
              </div>
            </div>

            <div className="panel-column right-section">

              <div className="sk-p sk-panel-row justify-left multi-label">
                Secret Key
                <span className="info sk-bold">{secret}</span>
              </div>
              <div className="sk-p sk-panel-row justify-left multi-label">
                Current Token
                <span className="info sk-bold">{otp}</span>
              </div>

              <div className="sk-panel-row" />
              <div className="sk-h2 sk-bold">Instructions</div>
              <div className="sk-h4 danger">Please read carefully.</div>
              <div className="sk-panel-row" />

              <ol>
                <li>
                  <div className="sk-p">Scan the QR code in your authenticator app.</div>
                </li>
                <li>
                  <div className="sk-p">Ensure you see the code <strong>{otp}</strong> generated by the app.</div>
                </li>
                <li>
                  <div className="sk-p">Save the <strong>Secret Key</strong> somewhere safe. You can export the Secret Key into a text file by choosing <i>Export Secret</i>.</div>
                  <div className="sk-panel-row"/>
                  <div className="sk-p"><a href="https://standardnotes.org/help/21/where-should-i-store-my-two-factor-authentication-secret-key" target="_blank" className="info">Key Storage Recommendations</a></div>
                  <div className="sk-panel-row"/>
                  <div className="sk-p">
                    <strong className="danger">Important: </strong>
                    Some apps, like Google Authenticator, do not back up and restore your secret keys if you lose your device or get a new one.
                    If you lose your Secret Key, you’ll be <strong className="danger">permanently locked out of your Standard Notes account.</strong>
                  </div>
                </li>
                <li>
                  <div className="sk-p">Press <i>Enable</i>.</div>
                </li>
              </ol>

            </div>
          </div>
        </div>
      )
    ]
  }
}
