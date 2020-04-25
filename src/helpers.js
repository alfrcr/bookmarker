export const groupChildren = (arr, parent = 0, level = 1) => {
  var out = [];
  for (let i in arr) {
    if (arr[i].parent === parent) {
      const children = groupChildren(arr, arr[i].id, level + 1);

      if (children.length) {
        arr[i].children = children;
      }

      out.push({ ...arr[i], level });
    }
  }
  return out;
};

export const flatten = (data) => {
  return data.reduce(function (result, next) {
    result.push(next);
    if (next.children) {
      result = result.concat(flatten(next.children));
      next.children = [];
    }
    return result;
  }, []);
};
