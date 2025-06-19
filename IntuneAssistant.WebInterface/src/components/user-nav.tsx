import { useState, useEffect } from "react"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// You'll need to create this auth context/hook
import { useAuth } from "@/lib/auth"
// You'll need to create this context for product selection
import { useProductContext } from "@/lib/product-context"

export function UserNav() {
    const { user, logout } = useAuth()
    const { currentProduct, setProduct, availableProducts } = useProductContext()
    const [isLoading, setIsLoading] = useState(false)

    if (!user) {
        return (
            <Button variant="outline" onClick={() => window.location.href = '/login'}>
                Sign In
            </Button>
        )
    }

    const handleLogout = async () => {
        setIsLoading(true)
        await logout()
        setIsLoading(false)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl || "/avatars/default.png"} alt={user.name} />
                        <AvatarFallback>{user.initials || user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                        Profile Settings
                    </DropdownMenuItem>

                    {availableProducts?.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Switch Product</DropdownMenuLabel>
                            {availableProducts.map(product => (
                                <DropdownMenuItem
                                    key={product.id}
                                    onClick={() => setProduct(product.id)}
                                    className={currentProduct === product.id ? "bg-muted" : ""}
                                >
                                    {product.name}
                                    {currentProduct === product.id && (
                                        <span className="ml-auto">✓</span>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                    {isLoading ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}