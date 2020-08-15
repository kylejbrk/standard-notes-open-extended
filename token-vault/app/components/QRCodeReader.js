import React from 'react';
import jsQR from 'jsqr';
import { parseKeyUri } from '../lib/otp';

export default class QRCodeReader extends React.Component {
  onImageSelected = evt => {
    const file = evt.target.files[0];
    const url = URL.createObjectURL(file);
    const img = new Image();
    const self = this;

    img.onload = function() {
      URL.revokeObjectURL(this.src);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = this.width;
      canvas.height = this.height;
      context.drawImage(this, 0, 0);
      const imageData = context.getImageData(0, 0, this.width, this.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        const otpData = parseKeyUri(code.data);
        if (otpData.type !== 'totp') {
          self.props.onError(`${otpData.type} is not supported.`);
        } else {
          self.props.onSuccess(otpData);
        }
      } else {
        self.props.onError('Error reading qrcode image');
      }
    };

    img.src = url;

    return false;
  };

  render() {
    return (
      <div className="file sk-button info">
        <label className="no-style">
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={this.onImageSelected}
          />
          <div className="sk-label">Upload QR Code</div>
        </label>
      </div>
    );
  }
}
