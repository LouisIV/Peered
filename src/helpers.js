export const Highest = arr =>
  (arr || []).reduce(
    (acc, el) => {
      acc.k[el] = acc.k[el] ? acc.k[el] + 1 : 1;
      acc.max = acc.max ? (acc.max < acc.k[el] ? el : acc.max) : el;
      return acc;
    },
    { k: {} }
  ).max;
