import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: "clothing" | "accessories" | "vinyl" | "digital"
}

const products: Product[] = [
  {
    id: 1,
    name: "PULSE Logo T-Shirt",
    price: 35,
    image: "/placeholder.svg?height=400&width=400",
    category: "clothing",
  },
  {
    id: 2,
    name: "Neon Horizon Hoodie",
    price: 65,
    image: "/placeholder.svg?height=400&width=400",
    category: "clothing",
  },
  {
    id: 3,
    name: "Digital Dreams Vinyl",
    price: 30,
    image: "/placeholder.svg?height=400&width=400",
    category: "vinyl",
  },
  {
    id: 4,
    name: "PULSE Snapback Cap",
    price: 28,
    image: "/placeholder.svg?height=400&width=400",
    category: "accessories",
  },
  {
    id: 5,
    name: "Synth Horizon Limited Vinyl",
    price: 40,
    image: "/placeholder.svg?height=400&width=400",
    category: "vinyl",
  },
  {
    id: 6,
    name: "PULSE LED Wristband",
    price: 15,
    image: "/placeholder.svg?height=400&width=400",
    category: "accessories",
  },
  {
    id: 7,
    name: "Digital Album Download",
    price: 12,
    image: "/placeholder.svg?height=400&width=400",
    category: "digital",
  },
  {
    id: 8,
    name: "Tour Long Sleeve Shirt",
    price: 45,
    image: "/placeholder.svg?height=400&width=400",
    category: "clothing",
  },
]

export default function MerchPage() {
  return (
    <div className="container mx-auto px-4 py-24 mt-10">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">OFFICIAL MERCH</h1>
        <p className="text-gray-300">Official PULSE merchandise. Limited editions and exclusive designs.</p>
      </div>

      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Filter by:</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-black/50 border-green-500/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="vinyl">Vinyl</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <Select defaultValue="featured">
            <SelectTrigger className="w-[180px] bg-black/50 border-green-500/20">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="bg-black/50 backdrop-blur-sm border-green-500/20 overflow-hidden">
            <div className="aspect-square relative bg-black/30">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-green-400 font-bold mt-1">${product.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2 w-full">
                <Select defaultValue="m">
                  <SelectTrigger className="bg-black/50 border-green-500/20">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s">S</SelectItem>
                    <SelectItem value="m">M</SelectItem>
                    <SelectItem value="l">L</SelectItem>
                    <SelectItem value="xl">XL</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-green-500 hover:bg-green-600 text-black">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="max-w-2xl mx-auto mt-16 p-8 bg-black/50 backdrop-blur-sm border border-green-500/20 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">CUSTOM ORDERS</h2>
        <p className="text-gray-300 mb-6">
          Looking for custom merchandise for your event or group? Contact us for bulk orders and custom designs.
        </p>
        <Button className="bg-green-500 hover:bg-green-600 text-black">CONTACT FOR CUSTOM ORDERS</Button>
      </div>
    </div>
  )
}
