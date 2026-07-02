import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PencilEdit02Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useProfile, useAttributes } from '@/data/queries'
import {
    useUpdateProfile,
    useAddAttribute,
    useUpdateAttribute,
    useDeleteAttribute,
} from '@/data/mutations'
import { uniqueSlug } from '@/lib/slug'
import type { Attribute } from '@/data/types'

const clampValue = (raw: string) =>
    Math.max(0, Math.min(100, Math.round(Number(raw) || 0)))

/** One attribute with its own local edit state + save/delete. */
function AttributeRow({ attr }: { attr: Attribute }) {
    const update = useUpdateAttribute()
    const remove = useDeleteAttribute()
    const [name, setName] = useState(attr.name)
    const [value, setValue] = useState(String(attr.value))

    const dirty = name !== attr.name || clampValue(value) !== attr.value

    return (
        <div className="flex items-end gap-2">
            <div className="flex-1">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Input
                type="number"
                min={0}
                max={100}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-20"
            />
            <Button
                variant="outline"
                size="sm"
                disabled={!dirty || update.isPending}
                onClick={() =>
                    update.mutate({
                        id: attr.id,
                        patch: { name: name.trim(), value: clampValue(value) },
                    })
                }
            >
                Save
            </Button>
            <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete attribute"
                disabled={remove.isPending}
                onClick={() => remove.mutate(attr.id)}
            >
                <HugeiconsIcon icon={Delete02Icon} />
            </Button>
        </div>
    )
}

function AddAttributeRow({ existingIds }: { existingIds: Set<string>; }) {
    const add = useAddAttribute()
    const [name, setName] = useState('')
    const [value, setValue] = useState('50')

    const submit = () => {
        const trimmed = name.trim()
        if (!trimmed) return
        add.mutate(
            {
                id: uniqueSlug(trimmed, existingIds),
                name: trimmed,
                value: clampValue(value),
                position: existingIds.size,
            },
            {
                onSuccess: () => {
                    setName('')
                    setValue('50')
                },
            },
        )
    }

    return (
        <div className="flex items-end gap-2">
            <div className="flex-1">
                <Input
                    placeholder="New attribute…"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <Input
                type="number"
                min={0}
                max={100}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-20"
            />
            <Button
                variant="secondary"
                size="sm"
                disabled={!name.trim() || add.isPending}
                onClick={submit}
            >
                Add
            </Button>
        </div>
    )
}

export function CharacterAdminDialog() {
    const [open, setOpen] = useState(false)
    const profile = useProfile()
    const attributes = useAttributes()
    const updateProfile = useUpdateProfile()

    const [role, setRole] = useState('')
    const [longest, setLongest] = useState('0')

    // Seed profile fields whenever the row loads/changes.
    useEffect(() => {
        if (profile.data) {
            setRole(profile.data.role ?? '')
            setLongest(String(profile.data.longest_streak))
        }
    }, [profile.data])

    const existingIds = new Set((attributes.data ?? []).map((a) => a.id))

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={PencilEdit02Icon} />
                        Edit character
                    </Button>
                }
            />
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit character</DialogTitle>
                </DialogHeader>

                {/* Profile */}
                <div className="grid gap-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="cad-role">Role</Label>
                        <Input
                            id="cad-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Backend Engineer Path"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="cad-longest">Longest streak (days)</Label>
                        <Input
                            id="cad-longest"
                            type="number"
                            min={0}
                            value={longest}
                            onChange={(e) => setLongest(e.target.value)}
                            className="w-28"
                        />
                    </div>
                    <Button
                        className="w-fit"
                        size="sm"
                        disabled={updateProfile.isPending}
                        onClick={() =>
                            updateProfile.mutate({
                                role: role.trim() || null,
                                longest_streak: Math.max(0, Math.round(Number(longest) || 0)),
                            })
                        }
                    >
                        Save profile
                    </Button>
                </div>

                <Separator />

                {/* Attributes */}
                <div className="grid gap-2">
                    <div className="text-sm font-medium">Attributes</div>
                    {(attributes.data ?? []).map((a) => (
                        <AttributeRow key={a.id} attr={a} />
                    ))}
                    <AddAttributeRow existingIds={existingIds} />
                </div>

                <DialogFooter>
                    <DialogClose render={<Button variant="outline">Done</Button>} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
