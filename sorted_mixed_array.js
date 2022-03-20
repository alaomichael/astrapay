const cards = [ 1.2,3/5,8,0.54, 0.541,0.5423,'King','Queen','Jack', 2,'King','Queen', 6, 5,7, 3,'Jack','King'
,'Queen','Jack','Queen','King','Queen','Jack',
'King','Queen','Jack','King','Queen','Queen','Jack',
'Queen','King','Queen' ]
// <!-- Requried Output = [2,3,5,6,8,'Jack','Queen','King']
const sorter = (a, b) => {
   if(typeof a === 'number' && typeof b === 'number'){
      return a - b;
      }else if(typeof a === 'number' && typeof b !== 'number'){
       return -1;
   }else if(typeof a !== 'number' && typeof b === 'number'){
      return 1;
   }else if(typeof a !== 'number' && typeof b !== 'number' && a === 'Jack' && b === 'Queen'){
      return -1;
   } else if(typeof a !== 'number' && typeof b !== 'number' && a === 'Jack' && b === 'King'){
      return -1;
   }else if(typeof a !== 'number' && typeof b !== 'number' && a === 'Queen' && b === 'King'){
      return -1;
   } else if(typeof a !== 'number' && typeof b !== 'number' && a === 'King' && b === 'Queen'){
      return 1;
   } else{
      return a > b ? 1 : -1;
   }
}

let len = cards.length;
cards.sort(sorter);

console.log(cards);