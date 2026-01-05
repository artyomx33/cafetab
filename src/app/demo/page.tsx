"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CategoryToggle,
  GroupCard,
  Input,
  LoadingSpinner,
  PinInput,
  ProductTile,
  QuantitySelector,
} from "@/components/ui";

export default function DemoPage() {
  const [pin, setPin] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-[#2D3436] mb-8">
          GolfTab UI Components Demo
        </h1>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="active">Active</Badge>
              <Badge variant="closed">Closed</Badge>
              <Badge variant="paid">Paid</Badge>
              <Badge variant="default">Default</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Input placeholder="Enter group name" />
          </CardContent>
        </Card>

        {/* PIN Input */}
        <Card>
          <CardHeader>
            <CardTitle>PIN Input</CardTitle>
          </CardHeader>
          <CardContent>
            <PinInput
              value={pin}
              onChange={setPin}
              onComplete={(value) => console.log("PIN:", value)}
            />
            <p className="text-center mt-4 text-gray-600">
              Entered PIN: {pin || "None"}
            </p>
          </CardContent>
        </Card>

        {/* Quantity Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Quantity Selector</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </CardContent>
        </Card>

        {/* Category Toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Category Toggle</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryToggle
              categoryName="Food & Beverages"
              isExpanded={isCategoryExpanded}
              itemCount={12}
              onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
            />
          </CardContent>
        </Card>

        {/* Product Tiles */}
        <Card>
          <CardHeader>
            <CardTitle>Product Tiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <ProductTile
                name="Hot Dog"
                price={4.5}
                onClick={() => console.log("Hot Dog selected")}
              />
              <ProductTile
                name="Soda"
                price={2.0}
                onClick={() => console.log("Soda selected")}
              />
              <ProductTile
                name="Golf Ball"
                price={5.99}
                onClick={() => console.log("Golf Ball selected")}
              />
              <ProductTile
                name="Water Bottle"
                price={1.5}
                onClick={() => console.log("Water Bottle selected")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Group Card */}
        <Card>
          <CardHeader>
            <CardTitle>Group Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GroupCard
              groupName="Hole 7 Crew"
              groupCode="H7C"
              status="active"
              itemCount={5}
              total={23.5}
              onClick={() => console.log("Group selected")}
            />
            <GroupCard
              groupName="Back Nine Squad"
              groupCode="BN9"
              status="closed"
              itemCount={8}
              total={42.0}
              onClick={() => console.log("Group selected")}
            />
            <GroupCard
              groupName="Morning Tee Time"
              groupCode="MTT"
              status="paid"
              itemCount={3}
              total={15.75}
              onClick={() => console.log("Group selected")}
            />
          </CardContent>
        </Card>

        {/* Loading Spinner */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Spinner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around items-center">
              <div className="text-center">
                <LoadingSpinner size="small" />
                <p className="text-sm text-gray-600 mt-2">Small</p>
              </div>
              <div className="text-center">
                <LoadingSpinner size="medium" />
                <p className="text-sm text-gray-600 mt-2">Medium</p>
              </div>
              <div className="text-center">
                <LoadingSpinner size="large" />
                <p className="text-sm text-gray-600 mt-2">Large</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
