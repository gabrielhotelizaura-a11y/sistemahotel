import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Wifi, Tv, Wind, UtensilsCrossed, Waves, Bath, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddRoomDialogProps {
    onRoomAdded?: () => void;
}

const ROOM_TYPES = [
    { value: 'Standard', label: 'Standard', priceRange: 'R$ 100-200' },
    { value: 'Deluxe', label: 'Deluxe', priceRange: 'R$ 200-350' },
    { value: 'Suite', label: 'Suite', priceRange: 'R$ 350-600' },
    { value: 'Premium', label: 'Premium', priceRange: 'R$ 600+' },
];

const AVAILABLE_AMENITIES = [
    { value: 'Wi-Fi', label: 'Wi-Fi', icon: Wifi },
    { value: 'TV', label: 'TV', icon: Tv },
    { value: 'Ar-condicionado', label: 'Ar-condicionado', icon: Wind },
    { value: 'Frigobar', label: 'Frigobar', icon: UtensilsCrossed },
    { value: 'Varanda', label: 'Varanda', icon: Sparkles },
    { value: 'Banheira', label: 'Banheira', icon: Bath },
    { value: 'Cofre', label: 'Cofre', icon: Shield },
    { value: 'Vista para o mar', label: 'Vista para o mar', icon: Waves },
    { value: 'Serviço de quarto', label: 'Serviço de quarto', icon: UtensilsCrossed },
];

export function AddRoomDialog({ onRoomAdded }: AddRoomDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form fields
    const [number, setNumber] = useState('');
    const [type, setType] = useState('');
    const [capacity, setCapacity] = useState('2');
    const [beds, setBeds] = useState('1');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    const resetForm = () => {
        setNumber('');
        setType('');
        setCapacity('2');
        setBeds('1');
        setPrice('');
        setDescription('');
        setSelectedAmenities([]);
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const validateForm = (): boolean => {
        if (!number.trim()) {
            toast.error('Número do quarto é obrigatório');
            return false;
        }
        if (!type) {
            toast.error('Tipo do quarto é obrigatório');
            return false;
        }
        if (!price || parseFloat(price) <= 0) {
            toast.error('Preço deve ser maior que zero');
            return false;
        }
        if (parseInt(capacity) <= 0) {
            toast.error('Capacidade deve ser maior que zero');
            return false;
        }
        if (parseInt(beds) <= 0) {
            toast.error('Número de camas deve ser maior que zero');
            return false;
        }
        if (selectedAmenities.length === 0) {
            toast.error('Selecione pelo menos uma comodidade');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Check if room number already exists
            const { data: existingRoom, error: checkError } = await supabase
                .from('rooms')
                .select('id')
                .eq('number', number.trim())
                .maybeSingle();

            // Se não é erro PGRST116 (zero ou mais de um resultado), relançar o erro
            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingRoom) {
                toast.error('Já existe um quarto com esse número');
                setLoading(false);
                return;
            }

            // Insert new room
            const { data, error } = await supabase
                .from('rooms')
                .insert({
                    number: number.trim(),
                    type,
                    capacity: parseInt(capacity),
                    beds: parseInt(beds),
                    price: parseFloat(price),
                    description: description.trim() || null,
                    amenities: selectedAmenities,
                    status: 'available',
                })
                .select()
                .single();

            if (error) throw error;

            toast.success(`Quarto ${number} adicionado com sucesso!`);
            resetForm();
            setOpen(false);

            if (onRoomAdded) {
                onRoomAdded();
            }
        } catch (error: any) {
            console.error('Error adding room:', error);
            toast.error(error.message || 'Erro ao adicionar quarto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Novo Quarto
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Quarto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="number">Número do Quarto *</Label>
                            <Input
                                id="number"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder="101"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Ex: 101, 201, 301</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo *</Label>
                            <Select value={type} onValueChange={setType} required>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROOM_TYPES.map(roomType => (
                                        <SelectItem key={roomType.value} value={roomType.value}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{roomType.label}</span>
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    {roomType.priceRange}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Capacity & Beds */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacidade *</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min="1"
                                max="10"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Nº de pessoas</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="beds">Camas *</Label>
                            <Input
                                id="beds"
                                type="number"
                                min="1"
                                max="5"
                                value={beds}
                                onChange={(e) => setBeds(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Nº de camas</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Preço/Noite *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="150.00"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Em reais (R$)</p>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-3">
                        <Label>Comodidades * (Selecione pelo menos uma)</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {AVAILABLE_AMENITIES.map(amenity => {
                                const Icon = amenity.icon;
                                const isSelected = selectedAmenities.includes(amenity.value);

                                return (
                                    <button
                                        key={amenity.value}
                                        type="button"
                                        onClick={() => toggleAmenity(amenity.value)}
                                        className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                      ${isSelected
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-muted hover:border-primary/50'
                                            }
                    `}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="text-sm">{amenity.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedAmenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {selectedAmenities.map(amenity => (
                                    <Badge key={amenity} variant="secondary" className="gap-1">
                                        {amenity}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                                            onClick={() => toggleAmenity(amenity)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição (Opcional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o quarto: vista, localização, características especiais..."
                            rows={3}
                        />
                    </div>

                    {/* Price Preview */}
                    {price && (
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Preview do Quarto</p>
                                    <p className="font-semibold">
                                        Quarto {number || '___'} • {type || 'Tipo'} • {capacity} pessoa(s)
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">
                                        R$ {parseFloat(price || '0').toFixed(2)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">por noite</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Adicionando...' : 'Adicionar Quarto'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
