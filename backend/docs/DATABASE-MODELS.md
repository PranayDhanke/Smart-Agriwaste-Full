# Database Models

Source of truth: `src/models/*.ts`

## BuyerAccount (`buyer.model.ts`)

- Identity: `buyerId` (unique), `firstName`, `lastName`, `username`
- Contact: `email`, `phone`
- KYC: `aadharnumber`, `aadharUrl`
- Address: `state`, `district`, `taluka`, `village`, `houseBuildingName`, `roadarealandmarkName`
- Finance: `wallet`
- Location: `coordinates.lat`, `coordinates.long`

## FarmerAccount (`farmer.model.ts`)

- Identity: `farmerId` (unique), `firstName`, `lastName`, `username`
- Contact/KYC: `email`, `phone`, `aadharnumber`, `aadharUrl`
- Farm docs: `farmDocUrl`
- Farm: `farmNumber`, `farmArea`, `farmUnit` (`hectare` or `acre`)
- Address: `state`, `district`, `taluka`, `village`, `houseBuildingName`, `roadarealandmarkName`
- Finance: `wallet`
- Location: `coordinates.lat`, `coordinates.long`

## Waste (`waste.model.ts`)

- Core: `title` (translated), `description` (translated)
- Classification: `wasteType`, `wasteProduct`, `wasteCategory`
- Inventory: `quantity`, `unit`, `isActive`
- Quality/Pricing: `moisture`, `price`
- Media: `imageUrl`
- Seller: `seller.farmerId`, `seller.name`, `seller.phone`, `seller.email`
- Address snapshot: nested `address.*`
- Indexes currently on: `wasteType`, `wasteProduct`, `wasteCategory`, `seller.farmerId`, `isActive`

## Order (`order.model.ts`)

- Parties: `buyerId`, `farmerId`
- Status: `status` (`pending`, `confirmed`, `cancelled`)
- Delivery: `deliveryMode`, `deliveryCharge`, `isOutForDelivery`, `isDelivered`
- Pricing flow: `pricingStatus` (`not_required`, `pending_farmer_input`, `pending_buyer_review`, `accepted`, `rejected`)
- Security: `deliverySecretCode`, `deliveryCodeRecipient`
- Payment: `hasPayment`, `paymentId`
- Amounts: `subTotalAmount`, `totalAmount`
- Buyer snapshot: `buyerInfo`
- Items: embedded order item snapshots with product + seller address info

## Negotiation (`negotiation.model.ts`)

- Parties: `buyerId`, `buyerName`, `farmerId`
- Item snapshot: `item` (product, seller, address)
- Commercials: `negotiatedPrice`
- State: `status` (`pending`, `accepted`, `rejected`)

## CommunityPost (`communityPost.model.ts`)

- Author: `authorId`, `authorName`, `authorImage`
- Content: `description`, `imageUrl`, `category`
- Engagement: `likes[]`, `saves[]`, `replies[]`

## Notification (`notification.model.ts`)

- Target: `userId`
- Content: `title`, `message`, `type`
- State: `read`

## Messages (`Messages.model.ts`)

- Content: `message`
- Sender: `userId`, `username`

## Model Improvement Backlog (Recommended)

- Add explicit indexes for common order and negotiation query paths.
- Add schema-level enums for all fixed strings used by APIs.
- Add `select` and lean query patterns in repositories where payload size matters.
- Introduce migration/version strategy if model fields evolve frequently.
