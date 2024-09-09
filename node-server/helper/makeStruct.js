// function makeStruct(keys) {
//   if (!keys) return null;
//   const k = keys.split(", ");
//   const count = k.length;

//   /** @constructor */
//   function constructor() {
//     for (let i = 0; i < count; i++) this[k[i]] = arguments[i];
//   }
//   return constructor;
// }

const makeStruct =
  (...keys) =>
  (...v) =>
    keys.reduce((o, k, i) => {
      o[k] = v[i];
      return o;
    }, {});

module.exports = makeStruct;
