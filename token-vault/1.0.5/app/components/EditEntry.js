import React from 'react';
import QRCodeReader from './QRCodeReader';
import { secretPattern } from '../lib/otp';

export default class EditEntry extends React.Component {
  static defaultProps = {
    entry: {}
  };

  constructor(props) {
    super(props);

    this.state = {
      id: this.props.id,
      entry: this.props.entry
    };
  }

  formatSecret(secret) {
    return secret.replace(/\s/g, '').toUpperCase();
  }

  handleInputChange = event => {
    const target = event.target;
    const name = target.name;

    const value =
      name === 'secret' ? this.formatSecret(target.value) : target.value;

    this.setState(state => ({
      entry: { ...state.entry, [name]: value }
    }));
  };

  onSave = e => {
    e.preventDefault();
    const { id, entry } = this.state;
    this.props.onSave({ id, entry });
  };

  onQRCodeSuccess = otpData => {
    const { issuer: labelIssuer, account } = otpData.label;
    const { issuer: queryIssuer, secret } = otpData.query;

    this.setState({
      entry: {
        service: labelIssuer || queryIssuer || '',
        account,
        secret: this.formatSecret(secret)
      }
    });
  };

  onQRCodeError = message => {
    console.warn('Failed to parse QRCode:', message);
  };

  render() {
    const { id, entry } = this.state;

    return (
      <div className="auth-edit sk-panel">
        <div className="sk-panel-content">
          <div className="sk-panel-section">
            <div className="sk-panel-section-title sk-panel-row">
              {id != null ? 'Edit entry' : 'Add new entry'}
              {id == null && (
                <QRCodeReader
                  onSuccess={this.onQRCodeSuccess}
                  onError={this.onQRCodeError}
                />
              )}
            </div>
            <form onSubmit={this.onSave}>
              <input
                name="service"
                className="sk-input contrast"
                placeholder="Service"
                value={entry.service}
                onChange={this.handleInputChange}
                type="text"
                required
              />
              <input
                name="account"
                className="sk-input contrast"
                placeholder="Account"
                value={entry.account}
                onChange={this.handleInputChange}
                type="text"
              />
              <input
                name="secret"
                className="sk-input contrast"
                placeholder="Secret"
                value={entry.secret}
                onChange={this.handleInputChange}
                type="text"
                pattern={secretPattern}
                required
              />
              <input
                name="notes"
                className="sk-input contrast"
                placeholder="Notes"
                value={entry.notes}
                onChange={this.handleInputChange}
                type="text"
              />
              <div className="sk-panel-row">
                <div className="sk-button-group stretch">
                  <button
                    type="button"
                    onClick={this.props.onCancel}
                    className="sk-button neutral"
                  >
                    <div className="sk-label">Cancel</div>
                  </button>
                  <button type="submit" className="sk-button info">
                    <div className="sk-label">
                      {id != null ? 'Save' : 'Create'}
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
