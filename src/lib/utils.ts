// taken from https://github.com/stellar/js-stellar-base/blob/714b214044628939f3cf22981772d5e7d7eaa947/src/util/continued_fraction.js

/* tslint:disable */
import BigNumber from 'bignumber.js';

const MAX_INT = ((1 << 31) >>> 0) - 1;

/**
 * Calculates and returns the best rational approximation of the given real number.
 * @private
 * @param {string|number|BigNumber} rawNumber Real number
 * @throws Error Throws `Error` when the best rational approximation cannot be found.
 * @returns {array} first element is n (numerator), second element is d (denominator)
 */
export function best_r(rawNumber) {
  let number = new BigNumber(rawNumber);
  let a;
  let f;
  const fractions = [
    [new BigNumber(0), new BigNumber(1)],
    [new BigNumber(1), new BigNumber(0)]
  ];
  let i = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (number.gt(MAX_INT)) {
      break;
    }
    a = number.floor();
    f = number.sub(a);
    const h = a.mul(fractions[i - 1][0]).add(fractions[i - 2][0]);
    const k = a.mul(fractions[i - 1][1]).add(fractions[i - 2][1]);
    if (h.gt(MAX_INT) || k.gt(MAX_INT)) {
      break;
    }
    fractions.push([h, k]);
    if (f.eq(0)) {
      break;
    }
    number = new BigNumber(1).div(f);
    i += 1;
  }
  const [n, d] = fractions[fractions.length - 1];

  if (n.isZero() || d.isZero()) {
    throw new Error("Couldn't find approximation");
  }

  return [n.toNumber(), d.toNumber()];
}

// copied from https://stackoverflow.com/a/54733755/603657
export function set(obj: object, path: string | [] | any, value: any) {
  if (Object(obj) !== obj) return obj; // When obj is not an object
  // If not yet an array, get the keys from the string-path
  if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
  path.slice(0, -1).reduce(
    (
      a,
      c,
      i // Iterate all of them except the last one
    ) =>
      Object(a[c]) === a[c] // Does the key exist and is its value an object?
        ? // Yes: then follow that path
          a[c]
        : // No: create the key. Is the next key a potential array-index?
          (a[c] =
            Math.abs(path[i + 1]) >> 0 === +path[i + 1]
              ? [] // Yes: assign a new array object
              : {}), // No: assign a new plain object
    obj
  )[path[path.length - 1]] = value; // Finally assign the value to the last key
  return obj; // Return the top-level object to allow chaining
}

export function upperSnakeCase(str: string) {
  if (!str) return '';

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/([a-z])([A-Z])/g, (_m, a, b) => a + '_' + b.toLowerCase())
    .replace(/[^A-Za-z0-9]+|_+/g, '_')
    .toUpperCase();
}
