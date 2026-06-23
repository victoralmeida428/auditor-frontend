import type { App } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Password from 'primevue/password'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Steps from 'primevue/steps'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import FileUpload from 'primevue/fileupload'
import Badge from 'primevue/badge'
import Tooltip from 'primevue/tooltip'

export function registerPrimeVueComponents(app: App) {
  app.component('Button', Button)
  app.component('InputText', InputText)
  app.component('Textarea', Textarea)
  app.component('Password', Password)
  app.component('Message', Message)
  app.component('DataTable', DataTable)
  app.component('Column', Column)
  app.component('Tag', Tag)
  app.component('Toast', Toast)
  app.component('ConfirmDialog', ConfirmDialog)
  app.component('Steps', Steps)
  app.component('Select', Select)
  app.component('Checkbox', Checkbox)
  app.component('FileUpload', FileUpload)
  app.component('Badge', Badge)
  app.directive('tooltip', Tooltip)
}
