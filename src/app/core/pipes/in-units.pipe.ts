import { Pipe, Injectable, PipeTransform } from "@angular/core";
import { AuthService } from "../providers/auth.service";

@Pipe({
    name: 'inUnits'
})
@Injectable()
export class InUnitsPipe implements PipeTransform {

    private uom: string = 'Metric';

    constructor(private $auth: AuthService) {
       this.$auth.authUser.subscribe((authUser: any) => {
           this.uom = authUser.units;
       });
    }

    transform(volumeInMilliliter: number): string {

        if (this.uom === 'Metric') {

            // eg. 250ml => 25cl NO
            // eg. 4140ml => 4,1l

            // probably a better way, but wanted to skip 'dl' and keep it displayed in "normal" format
            if (volumeInMilliliter > 1000) {
                return (volumeInMilliliter / 1000).toFixed(1) + ' L';
            // } else if (volumeInMilliliter > 150) {
            //     return (volumeInMilliliter / 10) + ' cl';
            } else {
                return volumeInMilliliter + ' mL';
            }

        } else if (this.uom === 'Imperial') {

        }

    }
}