import { Pipe, Injectable, PipeTransform } from "@angular/core";

@Pipe({
    name: 'categoryIcon'
})
@Injectable()
export class ItemCategoryIconPipe implements PipeTransform {
    transform(itemCategoryId: number): string {
        let icon = 'fa-glass-whiskey';
        switch (itemCategoryId) {
            case 2:
                icon = 'fa-cocktail';
                break;
            case 3:
                icon = 'fa-mug-hot';
                break;
            case 4:
                icon = 'fa-glass-whiskey';
                break;
            default:
                break;
        }
        return icon;
    }
}