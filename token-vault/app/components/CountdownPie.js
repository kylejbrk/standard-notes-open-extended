import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const animationName = (token) => `countdown${token}`;

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

function calculateOpaOffset(left, total) {
  const percentage = calculatePercentage(left, total) * 100;
  const percTo50 = 50 - percentage;
  // 8 is an offset because the animation is not in sync otherwise
  return percTo50 < 0 ? 0 : Math.ceil(Math.min(percTo50 + 8, 50));
}

function calculateRotaOffset(left, total) {
  return calculatePercentage(left, total) * 360;
}

function calculatePercentage(left, total) {
  return (total - left) / total;
}

function useRotateAnimation(token, left, total) {
  useEffect(
    function createRotateAnimation() {
      const style = document.createElement('style');
      document.head.appendChild(style);
      const styleSheet = style.sheet;

      const rotaKeyframes = rotaAnimation(
        token,
        calculateRotaOffset(left, total)
      );
      const opaKeyframes = opaAnimation(token, calculateOpaOffset(left, total));
      const opaReverseKeyframes = opaReverseAnimation(
        token,
        calculateOpaOffset(left, total)
      );

      styleSheet.insertRule(rotaKeyframes, styleSheet.cssRules.length);
      styleSheet.insertRule(opaKeyframes, styleSheet.cssRules.length);
      styleSheet.insertRule(opaReverseKeyframes, styleSheet.cssRules.length);

      function cleanup() {
        style.remove();
      }

      const timer = setTimeout(cleanup, left * 1000);

      return () => {
        clearTimeout(timer);
        cleanup();
      };
    },
    [token, left, total]
  );
}

const CountdownPie = ({ token, left, total }) => {
  useRotateAnimation(token, left, total);

  return (
    <div className="countdown-pie">
      <div
        className="pie spinner"
        style={{
          animation: `rota_${animationName(token)} ${left}s linear`,
        }}
      />
      <div className="pie background" />
      <div
        className="pie filler"
        style={{
          animation: `opa_r_${animationName(token)} ${left}s steps(1, end)`,
        }}
      />
      <div
        className="mask"
        style={{
          animation: `opa_${animationName(token)} ${left}s steps(1, end)`,
        }}
      />
    </div>
  );
};

CountdownPie.propTypes = {
  token: PropTypes.string.isRequired,
  left: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

export default CountdownPie;
