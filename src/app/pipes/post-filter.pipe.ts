import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'postFilter'
})
export class PostFilterPipe implements PipeTransform {

  transform(array: any[], args?: any): any[] {
    return this.filterArray(array, args);
  }

  filterArray(array: any[], test: string): any[] {
    let arrayspot = -1;

    if(!array) return [];

    for(let i = 0; i < array.length; i++) {
      if(array[i] && array[i]['slug'] && array[i]['slug'] === test){
        arrayspot = i;
      }
    }
    console.log(arrayspot);
    console.log(array, test);
    console.log(new Array(array[arrayspot]));
    return (arrayspot !== -1) ? new Array(array[arrayspot]): [];
  }

}
