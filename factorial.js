// https://stackoverflow.com/a/3959275/6702274

importScripts("bignumber.js");

var f = [new BigNumber("1"), new BigNumber("1")];
var i = 2;
function factorial(n)
{
  if (typeof f[n] != 'undefined')
    return f[n];
  var result = f[i-1];
  for (; i <= n; i++)
      f[i] = result = result.multiply(i.toString());
  return result;
}
