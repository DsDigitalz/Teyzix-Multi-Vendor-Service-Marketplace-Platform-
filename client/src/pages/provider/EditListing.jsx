import { useParams } from 'react-router-dom'
import ListingForm from '../../components/ListingForm'

export default function EditListing() {
  const { id } = useParams()
  return <ListingForm listingId={id} />
}