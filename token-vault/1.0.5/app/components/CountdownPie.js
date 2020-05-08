import React from 'react';

const animationName = token => `countdown${token}`;

const rotaAnimation = (token, offset) => `@keyframes rota_${animationName(
  token
)} {
  0% {
    transform: rotate(${offset}deg);
  }

  100% {
    transform: rotate(360deg);
  }
}`;

const opaAnimation = (token, offset) => `@keyframes opa_${animationName(
  token
)} {
  0% {
    opacity: 1;
  }

  ${offset}%,
  100% {
    opacity: 0;
  }
}`;

const opaReverseAnimation = (
  token,
  offset
) => `@keyframes opa_r_${animationName(token)} {
  0% {
    opacity: 0;
  }

  ${offset}%,
  100% {
    opacity: 1;
  }
}`;

class CountdownPie extends React.Component {
  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  calculateRotaOffset(left, total) {
    return this.calculatePercentage(left, total) * 360;
  }

  calculateOpaOffset(left, total) {
    const percentage = this.calculatePercentage(left, total) * 100;
    const percTo50 = 50 - percentage;
    // 8 is an offset because the animation is not in sync otherwise
    return percTo50 < 0 ? 0 : Math.ceil(Math.min(percTo50 + 8, 50));
  }

  calculatePercentage(left, total) {
    return (total - left) / total;
  }

  updateCountdown(left, total) {
    const { token } = this.props;
    const styleSheet = document.styleSheets[0];

    const rotaKeyframes = rotaAnimation(
      token,
      this.calculateRotaOffset(left, total)
    );
    const opaKeyframes = opaAnimation(
      token,
      this.calculateOpaOffset(left, total)
    );
    const opaReverseKeyframes = opaReverseAnimation(
      token,
      this.calculateOpaOffset(left, total)
    );

    styleSheet.insertRule(rotaKeyframes, styleSheet.cssRules.length);
    styleSheet.insertRule(opaKeyframes, styleSheet.cssRules.length);
    styleSheet.insertRule(opaReverseKeyframes, styleSheet.cssRules.length);
    this.timer = setTimeout(this.removeRules.bind(this, token), left * 1000);
  }

  removeRules(token) {
    const ruleNames = [
      `rota_${animationName(token)}`,
      `opa_${animationName(token)}`,
      `opa_r_${animationName(token)}`
    ];

    ruleNames.forEach(r => this.removeRule(r));
  }

  removeRule(ruleName) {
    const styleSheet = document.styleSheets[0];
    const rules = styleSheet.cssRules;

    for (const idx in rules) {
      if (rules[idx].name === ruleName) {
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

    return (
      <div className="countdown-pie">
        <div
          className="pie spinner"
          style={{
            animation: `rota_${animationName(this.props.token)} ${left}s linear`
          }}
        />
        <div className="pie background" />
        <div
          className="pie filler"
          style={{
            animation: `opa_r_${animationName(
              this.props.token
            )} ${left}s steps(1, end)`
          }}
        />
        <div
          className="mask"
          style={{
            animation: `opa_${animationName(
              this.props.token
            )} ${left}s steps(1, end)`
          }}
        />
      </div>
    );
  }
}

export default CountdownPie;
