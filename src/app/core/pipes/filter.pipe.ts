import { Pipe, Injectable, PipeTransform } from "@angular/core";

@Pipe({
    name: 'filter'
})
@Injectable()
export class FilterPipe implements PipeTransform {
    transform(items: any[], field: string, value: string): any[] {
        if (!items) return [];
        if (!value || value.length == 0) return items;

        return items.filter((item: any) => {
            if (typeof item[field] === 'string') {
                return item[field].toLowerCase().indexOf(value.toLowerCase()) != -1;
            } else {
                return item[field] === value;
            }
        })
    }
}