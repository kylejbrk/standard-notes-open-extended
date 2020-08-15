import React from 'react';

export default class AuthMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    };
  }

  onToggle = () => {
    this.setState({
      show: !this.state.show
    });
  };

  onEdit = () => {
    this.onToggle();
    this.props.onEdit();
  };

  onRemove = () => {
    this.onToggle();
    this.props.onRemove();
  };

  render() {
    return (
      <div className="auth-menu">
        <div className="sk-button" onClick={this.onToggle}>
          <div className="sk-label">•••</div>
        </div>
        {this.state.show && [
          <div className="auth-overlay" onClick={this.onToggle} />,
          <div className="sk-menu-panel">
            <div className="sk-menu-panel-row" onClick={this.onEdit}>
              <div className="sk-label">Edit</div>
            </div>
            <div className="sk-menu-panel-row" onClick={this.onRemove}>
              <div className="sk-label">Remove</div>
            </div>
          </div>
        ]}
      </div>
    );
  }
}
