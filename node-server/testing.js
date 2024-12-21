function solve(n, t) {
  sample = 0;
  favourable = 0;
  for (let a = 0; a <= n / 2; a++) {
    sample++;
    if ((Math.abs(n / 2 - 2 * a) * 200) / n <= t) favourable++;
  }
  console.log(`${sample}, ${favourable}`);
}

for (let i = 1; i <= 10000; i++) {
  console.log(`Solve for ${i} and ${0}:`);
  solve(i, 0);
  console.log(`Solve for ${i} and ${5}:`);
  solve(i, 5);
}
