import { tr } from '../i18n'
import { toast } from 'sonner'
import { whatsappUrl } from '../utils/whatsapp'
export function openWhatsApp(
  phone: string,
  message = tr('Hola, quiero consultar el menú de Dieguito.'),
) {
  try {
    window.open(whatsappUrl(phone, message), '_blank', 'noopener,noreferrer')
  } catch (error) {
    toast.error((error as Error).message)
  }
}
