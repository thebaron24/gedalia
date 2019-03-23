import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter'
})
export class SearchFilterPipe implements PipeTransform {

  transform(items: any[], searchText?: any): any {

  	if(!items) return [];
    if(!searchText) return items;
		
		searchText = searchText.toLowerCase();
    
    return items.filter( item => {
      return (
      	item.title.rendered.toLowerCase().includes(searchText) ||
      	item.content.rendered.toLowerCase().includes(searchText)
      );
    });
  }

  filterArray(array: any[], searchText: string): any[] {
    let arrayspot = -1;

    if(!array) return [];

    for(let i = 0; i < array.length; i++) {
      if(array[i] && array[i]['slug'] && array[i]['slug'] === searchText){
        arrayspot = i;
      }
    }
    return (arrayspot !== -1) ? new Array(array[arrayspot]): [];
  }

}
