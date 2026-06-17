import {
  Bath,
  Beer,
  CircleDollarSign,
  Dog,
  Leaf,
  Lock,
  Moon,
  Mountain,
  Music,
  SquareParking,
  Sunrise,
  Tag,
  TreePine,
  Users,
  Utensils,
  Volume2,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

/** Maps a characteristic id to its Lucide icon. Falls back to a generic tag. */
const ICONS: Record<string, LucideIcon> = {
  water: Waves,
  sunset: Sunrise,
  view: Mountain,
  shaded: TreePine,
  cannabis: Leaf,
  loud: Volume2,
  byob: Beer,
  private: Lock,
  aux: Music,
  charging: Zap,
  wifi: Wifi,
  bathroom: Bath,
  parking: SquareParking,
  free: CircleDollarSign,
  food: Utensils,
  biggroup: Users,
  dog: Dog,
  openlate: Moon,
};

export function characteristicIcon(id: string): LucideIcon {
  return ICONS[id] ?? Tag;
}
