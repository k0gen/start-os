import { Component } from '@angular/core'
import { AlertController, NavController } from '@ionic/angular'
import { ApiService, DiskInfo } from 'src/app/services/api/api.service'
import { ErrorToastService } from '@start9labs/shared'
import { StateService } from 'src/app/services/state.service'

@Component({
  selector: 'app-transfer',
  templateUrl: 'transfer.page.html',
  styleUrls: ['transfer.page.scss'],
})
export class TransferPage {
  loading = true
  drives: DiskInfo[] = []

  constructor(
    private readonly apiService: ApiService,
    private readonly navCtrl: NavController,
    private readonly alertCtrl: AlertController,
    private readonly errToastService: ErrorToastService,
    private readonly stateService: StateService,
  ) {}

  async ngOnInit() {
    await this.getDrives()
  }

  async refresh() {
    this.loading = true
    await this.getDrives()
  }

  async getDrives() {
    try {
      const disks = await this.apiService.getDrives()
      this.drives = disks.filter(d => d.partitions.length && d.guid)
    } catch (e: any) {
      this.errToastService.present(e)
    } finally {
      this.loading = false
    }
  }

  async select(target: DiskInfo) {
    const { logicalname, guid } = target

    if (!logicalname) return

    const alert = await this.alertCtrl.create({
      header: 'Warning',
      message:
        'Data from this drive will not be deleted, but you will not be able to use this drive to run embassyOS after the data is transferred. Attempting to use this drive after data is transferred could cause transferred services to not function properly, and may cause data corruption.',
      buttons: [
        {
          role: 'cancel',
          text: 'Cancel',
        },
        {
          text: 'Continue',
          handler: () => {
            this.stateService.recoverySource = {
              type: 'migrate',
              guid: guid!,
            }
            this.navCtrl.navigateForward(`/embassy`, {
              queryParams: { action: 'transfer' },
            })
          },
        },
      ],
    })
    await alert.present()
  }
}