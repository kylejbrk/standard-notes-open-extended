import React from 'react';

const animationName = token => `countdown${token}`;
const animation = (token, offset) => `@keyframes ${animationName(token)} {
  from {
    stroke-dashoffset: ${offset}px;
  }
  to {
    stroke-dashoffset: 113px;
  }
}`;

class Countdown extends React.Component {
  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  calculateInitialOffset(left, total) {
    const percentage = (left * 100) / total;
    return 113 - (percentage * 113) / 100 + 12; // 12 is an offset so that the animation starts immediately
  }

  updateCountdown(left, total) {
    const { token } = this.props;
    const styleSheet = document.styleSheets[0];
    const keyframes = animation(
      token,
      this.calculateInitialOffset(left, total)
    );
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
    this.timer = setTimeout(this.removeRule.bind(this, token), left * 1000);
  }

  removeRule(token) {
    const styleSheet = document.styleSheets[0];
    const rules = styleSheet.cssRules;
    const name = animationName(token);
    for (const idx in rules) {
      if (rules[idx].name === name) {
        styleSheet.removeRule(idx);
        break;
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    // Only update the animation if the token changed
    if (nextProps.token === this.props.token) {
      return false;
    }
    return true;
  }

  render() {
    const { left, total } = this.props;
    this.updateCountdown(left, total);

    const style = {
      animation: `${animationName(this.props.token)} ${left}s linear forwards`
    };

    return (
      <svg id="countdown" viewBox="0 0 40 40">
        <circle style={style} r="16" cx="20" cy="20" />
      </svg>
    );
  }
}

export default Countdown;
