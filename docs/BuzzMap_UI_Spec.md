# BuzzMap UI Specification

**Version:** 1.0
**Date:** 2026-03-31
**Framework:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
**Design System:** Navy/Indigo primary, Amber CTAs, Honeycomb visual motif

---

## Design Philosophy

### Aesthetic Direction: "East African Digital Marketplace"

A warm, trustworthy marketplace aesthetic that bridges modern tech with East African cultural warmth. Clean, functional interfaces with strategic pops of amber/gold that evoke trust and commerce. The honeycomb motif reinforces the collaborative nature of the platform.

### Color Palette

```css
/* Primary: Deep Navy (Trust, Professionalism) */
--navy-900: #0f172a;
--navy-800: #1e293b;
--navy-700: #334155;
--navy-600: #475569;

/* Accent: Warm Amber (Commerce, Trust, Honey) */
--amber-500: #f59e0b;
--amber-400: #fbbf24;
--amber-300: #fcd34d;

/* Secondary: Teal (Growth, Fresh) */
--teal-500: #14b8a6;
--teal-400: #2dd4bf;

/* Neutrals */
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-900: #0f172a;

/* Semantic */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
```

### Typography

```css
/* Display: Playfair Display - Elegant, trustworthy */
--font-display: 'Playfair Display', Georgia, serif;

/* Body: DM Sans - Clean, modern, readable */
--font-body: 'DM Sans', system-ui, sans-serif;

/* Mono: JetBrains Mono - Code, prices */
--font-mono: 'JetBrains Mono', monospace;
```

### Spatial System

All measurements in `rem`, `em`, `%`, `vh`, `vw`. **NO pixels.**

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

### Motion Philosophy

- **Page transitions:** Fade + subtle slide (300ms ease-out)
- **Card hover:** Scale 1.02, shadow lift (200ms)
- **Modal open:** Fade + scale from 0.95 (250ms spring)
- **Skeleton loaders:** Shimmer animation for content placeholders
- **Success feedback:** Subtle pulse on action completion

---

## Component Inventory

### 1. Buttons

**Variants:**
- `primary` — Amber background, dark text (CTAs, main actions)
- `secondary` — Navy outline, navy text (secondary actions)
- `ghost` — Transparent, subtle hover (tertiary actions)
- `destructive` — Red background (delete, cancel actions)

**Sizes:**
- `sm` — Compact (32px height)
- `default` — Standard (40px height)
- `lg` — Large (48px height)

**States:**
- Default, Hover (slight lift), Active (pressed), Disabled (50% opacity), Loading (spinner)

```tsx
<Button variant="primary" size="lg" className="gap-2">
  <ShoppingBagIcon data-icon="inline-start" />
  Shop Now
</Button>
```

### 2. Cards

**POV Card (Core content unit)**
```tsx
<Card className="overflow-hidden">
  <div className="aspect-video relative">
    <MediaThumbnail src={mediaUrl} alt={caption} />
    <Badge className="absolute top-3 right-3" variant={recommends ? 'success' : 'secondary'}>
      {recommends ? 'Recommended' : 'Skip'}
    </Badge>
  </div>
  <CardContent className="p-4">
    <div className="flex items-start gap-3">
      <Avatar>
        <AvatarImage src={author.avatarUrl} />
        <AvatarFallback>{author.firstName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{author.firstName}</p>
        <p className="text-sm text-muted-foreground truncate">{businessName}</p>
      </div>
      <div className="flex items-center gap-1">
        <StarIcon className="size-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-medium">{starRating}</span>
      </div>
    </div>
    <p className="mt-3 line-clamp-2 text-sm">{caption}</p>
    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
      <button className="flex items-center gap-1 hover:text-primary">
        <HeartIcon data-icon="inline-start" />
        {likeCount}
      </button>
      <button className="flex items-center gap-1 hover:text-primary">
        <MessageCircleIcon data-icon="inline-start" />
        {commentCount}
      </button>
      <button className="flex items-center gap-1 hover:text-primary ml-auto">
        <ShareIcon data-icon="inline-start" />
        Share
      </button>
    </div>
  </CardContent>
</Card>
```

**Business Card**
```tsx
<Card className="group cursor-pointer">
  <div className="h-32 bg-gradient-to-br from-navy-700 to-navy-900 relative">
    <img src={coverImageUrl} className="w-full h-full object-cover" />
    {isVerified && (
      <Badge className="absolute bottom-3 left-3" variant="success">
        <CheckCircleIcon data-icon="inline-start" />
        Verified
      </Badge>
    )}
  </div>
  <CardContent className="p-4">
    <div className="flex items-center gap-3 -mt-10 mb-3">
      <Avatar className="size-14 border-4 border-background">
        <AvatarImage src={logoUrl} />
        <AvatarFallback className="text-lg">{name[0]}</AvatarFallback>
      </Avatar>
    </div>
    <h3 className="font-semibold truncate">{name}</h3>
    <p className="text-sm text-muted-foreground truncate">{category}</p>
    <div className="mt-3 flex items-center gap-2">
      <StarIcon className="size-4 fill-amber-400 text-amber-400" />
      <span className="font-medium">{avgRating}</span>
      <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
    </div>
  </CardContent>
</Card>
```

**Product Card**
```tsx
<Card className="group">
  <div className="aspect-square relative overflow-hidden rounded-t-lg">
    <img src={images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
    {stockQuantity === 0 && (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <Badge variant="destructive">Out of Stock</Badge>
      </div>
    )}
  </div>
  <CardContent className="p-4">
    <p className="font-medium truncate">{name}</p>
    <p className="text-2xl font-bold mt-2">
      <span className="text-sm text-muted-foreground">KES</span>
      {price.toLocaleString()}
    </p>
    <Button className="w-full mt-3" size="sm" disabled={stockQuantity === 0}>
      <ShoppingCartIcon data-icon="inline-start" />
      Add to Cart
    </Button>
  </CardContent>
</Card>
```

### 3. Navigation

**Top Nav Bar**
```tsx
<nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-16 items-center justify-between">
    {/* Logo */}
    <a href="/" className="flex items-center gap-2">
      <HoneycombIcon className="size-8 text-amber-500" />
      <span className="text-xl font-display font-bold">BuzzMap</span>
    </a>

    {/* Search (Desktop) */}
    <div className="hidden md:flex flex-1 max-w-md mx-8">
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input className="pl-10 bg-muted/50" placeholder="Search businesses, products..." />
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="relative">
        <BellIcon />
        <span className="absolute top-1 right-1 size-2 bg-amber-500 rounded-full" />
      </Button>
      
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="size-8">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.firstName[0]}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem href="/dashboard">
              <LayoutDashboardIcon data-icon="inline-start" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem href="/orders">
              <PackageIcon data-icon="inline-start" />
              My Orders
            </DropdownMenuItem>
            <DropdownMenuItem href="/messages">
              <MessageCircleIcon data-icon="inline-start" />
              Messages
              <Badge className="ml-auto">3</Badge>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem href="/settings">
              <SettingsIcon data-icon="inline-start" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOutIcon data-icon="inline-start" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => openAuthModal('login')}>
            Log in
          </Button>
          <Button variant="primary" onClick={() => openAuthModal('register')}>
            Get Started
          </Button>
        </div>
      )}
    </div>
  </div>
</nav>
```

### 4. Onboarding Modals

**Customer Registration Modal (3 Steps)**

Step 1: Credentials
```tsx
<Dialog open={step === 1} onOpenChange={() => {}}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Let's get you started</DialogTitle>
      <DialogDescription>Create your account to discover trusted local businesses</DialogDescription>
    </DialogHeader>
    
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" placeholder="Jane" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" placeholder="Wanjiku" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="jane@example.com" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <InputGroup>
          <InputGroupAddon>+254</InputGroupAddon>
          <InputGroupInput id="phone" type="tel" placeholder="712 345 678" />
        </InputGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" placeholder="Create a strong password" />
        <PasswordRequirements password={password} />
      </div>
      
      <Button type="submit" className="w-full" onClick={() => setStep(2)}>
        Continue
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </form>
    
    <DialogFooter className="text-sm text-muted-foreground">
      Already have an account? 
      <button className="text-primary hover:underline" onClick={() => setAuthMode('login')}>
        Log in
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Step 2: Interests
```tsx
<div className="space-y-4">
  <DialogHeader>
    <DialogTitle>What are you into?</DialogTitle>
    <DialogDescription>Select at least 3 categories to personalize your feed</DialogDescription>
  </DialogHeader>
  
  <div className="grid grid-cols-2 gap-3">
    {interests.map((interest) => (
      <button
        key={interest.id}
        type="button"
        onClick={() => toggleInterest(interest.id)}
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg border transition-all",
          selectedInterests.includes(interest.id)
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <div className={cn(
          "size-10 rounded-full flex items-center justify-center",
          selectedInterests.includes(interest.id)
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}>
          {interest.icon}
        </div>
        <span className="font-medium">{interest.name}</span>
        {selectedInterests.includes(interest.id) && (
          <CheckCircleIcon className="ml-auto size-5 text-primary" />
        )}
      </button>
    ))}
  </div>
  
  <div className="flex justify-between pt-4">
    <Button variant="ghost" onClick={() => setStep(1)}>
      <ArrowLeftIcon data-icon="inline-start" />
      Back
    </Button>
    <Button disabled={selectedInterests.length < 3} onClick={() => setStep(3)}>
      Continue
      <ArrowRightIcon data-icon="inline-end" />
    </Button>
  </div>
</div>
```

Step 3: Verification
```tsx
<div className="text-center space-y-6 py-8">
  <div className="size-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
    <MailIcon className="size-10 text-primary" />
  </div>
  
  <DialogHeader>
    <DialogTitle>Check your email</DialogTitle>
    <DialogDescription>
      We've sent a verification link to <span className="font-medium">{email}</span>. 
      Click the link to activate your account.
    </DialogDescription>
  </DialogHeader>
  
  <div className="space-y-3">
    <Button className="w-full" onClick={checkVerification}>
      I've verified my email
    </Button>
    <Button variant="ghost" className="w-full" onClick={resendVerification}>
      Resend verification email
    </Button>
  </div>
  
  <p className="text-sm text-muted-foreground">
    Go to feed while waiting?{' '}
    <button className="text-primary hover:underline" onClick={skipToFeed}>
      Skip for now
    </button>
  </p>
</div>
```

**Business Registration Modal (5 Steps)**
```tsx
// Steps: Credentials → Business Details → Location → Logo → Verification
// Similar structure to customer modal with business-specific fields:
// Step 2: businessName, businessDescription, businessCategory
// Step 3: businessType (RETAIL/SERVICE/RESTAURANT/ONLINE), location, operatingHours
// Step 4: logo upload with preview
// Step 5: Email verification
```

### 5. Content Feed

```tsx
<div className="min-h-screen bg-muted/30">
  <header className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
    <div className="container">
      <Tabs value={activeTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  </header>
  
  <main className="container py-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {povs.map((pov) => (
        <POVCard key={pov.id} pov={pov} />
      ))}
    </div>
    
    {isLoading && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <Skeleton className="aspect-video rounded-t-lg" />
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </main>
  
  {/* FAB for creating POV */}
  <Button
    size="lg"
    className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg"
    onClick={() => router.push('/pov/create')}
  >
    <PlusIcon data-icon="inline-start" />
    <span className="sr-only">Create POV</span>
  </Button>
</div>
```

### 6. Business Profile

```tsx
<div className="min-h-screen">
  {/* Cover Image */}
  <div className="h-64 md:h-80 bg-gradient-to-br from-navy-800 to-navy-900 relative">
    <img src={business.coverImageUrl} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
  </div>
  
  {/* Profile Header */}
  <div className="container -mt-16 relative">
    <div className="flex flex-col md:flex-row md:items-end gap-4">
      <Avatar className="size-32 border-4 border-background shadow-xl">
        <AvatarImage src={business.logoUrl} />
        <AvatarFallback className="text-3xl">{business.name[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-display font-bold">{business.name}</h1>
          {business.isVerified && (
            <Badge variant="success" className="gap-1">
              <CheckCircleIcon data-icon="inline-start" />
              Verified
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">{business.category}</p>
      </div>
      
      <div className="flex gap-2 pb-4">
        <Button variant="secondary">
          <BellIcon data-icon="inline-start" />
          Follow
        </Button>
        <Button variant="primary">
          <MessageCircleIcon data-icon="inline-start" />
          Message
        </Button>
      </div>
    </div>
    
    {/* Stats */}
    <div className="flex gap-8 py-6 border-b">
      <div>
        <p className="text-2xl font-bold">{business.avgRating}</p>
        <p className="text-sm text-muted-foreground">Rating</p>
      </div>
      <div>
        <p className="text-2xl font-bold">{business.totalReviews}</p>
        <p className="text-sm text-muted-foreground">Reviews</p>
      </div>
      <div>
        <p className="text-2xl font-bold">{followers}</p>
        <p className="text-sm text-muted-foreground">Followers</p>
      </div>
    </div>
    
    {/* Tabs */}
    <Tabs defaultValue="povs" className="mt-6">
      <TabsList>
        <TabsTrigger value="povs">Reviews ({povs.length})</TabsTrigger>
        <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
      </TabsList>
      
      <TabsContent value="povs" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {povs.map((pov) => (
            <POVCard key={pov.id} pov={pov} compact />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="products" className="mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="about" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{business.description}</p>
            
            <Separator className="my-6" />
            
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-muted-foreground">{business.location}</p>
            
            {business.operatingHours && (
              <>
                <Separator className="my-6" />
                <h3 className="font-semibold mb-2">Hours</h3>
                <p className="text-muted-foreground">{business.operatingHours}</p>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</div>
```

### 7. Product Shelf

```tsx
<div className="min-h-screen bg-muted/30">
  <header className="bg-background border-b">
    <div className="container py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Product Shelf</h1>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Category Filters */}
      <ScrollArea className="mt-4 -mx-4 px-4">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  </header>
  
  <main className="container py-6">
    {products.length === 0 ? (
      <Empty
        title="No products found"
        description="Try adjusting your filters or check back later."
        icon={PackageIcon}
        action={
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )}
  </main>
</div>
```

### 8. In-App Messaging

```tsx
<div className="flex h-[calc(100dvh-4rem)] border-b bg-background">
  {/* Conversation List */}
  <aside className="w-80 border-r flex flex-col">
    <div className="p-4 border-b">
      <h2 className="font-semibold">Messages</h2>
    </div>
    
    <ScrollArea className="flex-1">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => setActiveConversation(conv.id)}
          className={cn(
            "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left",
            activeConversation === conv.id && "bg-muted"
          )}
        >
          <Avatar className="size-12">
            <AvatarImage src={conv.participant.avatarUrl} />
            <AvatarFallback>{conv.participant.firstName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-semibold truncate">{conv.participant.firstName}</p>
              <span className="text-xs text-muted-foreground">{formatTime(conv.lastMessageAt)}</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
          </div>
          {conv.unreadCount > 0 && (
            <Badge className="size-5 p-0 justify-center">{conv.unreadCount}</Badge>
          )}
        </button>
      ))}
    </ScrollArea>
  </aside>
  
  {/* Chat Thread */}
  <main className="flex-1 flex flex-col">
    {/* Chat Header */}
    <header className="p-4 border-b flex items-center gap-3">
      <Avatar className="size-10">
        <AvatarImage src={currentConversation?.participant.avatarUrl} />
        <AvatarFallback>{currentConversation?.participant.firstName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold">{currentConversation?.participant.firstName}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className={cn(
            "size-2 rounded-full",
            isOnline ? "bg-green-500" : "bg-gray-400"
          )} />
          {isOnline ? 'Online' : 'Last seen recently'}
        </div>
      </div>
    </header>
    
    {/* Messages */}
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.senderId === currentUserId ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[70%] rounded-2xl px-4 py-2",
              msg.senderId === currentUserId
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}>
              <p>{msg.content}</p>
              <div className={cn(
                "flex items-center gap-1 mt-1 text-xs",
                msg.senderId === currentUserId ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                <span>{formatTime(msg.createdAt)}</span>
                {msg.senderId === currentUserId && (
                  msg.readAt ? <CheckCheckIcon className="size-3" /> : <CheckIcon className="size-3" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
    
    {/* Typing Indicator */}
    {isTyping && (
      <div className="px-4 py-2 text-sm text-muted-foreground">
        {typingUser} is typing...
      </div>
    )}
    
    {/* Input */}
    <div className="p-4 border-t">
      <form className="flex items-end gap-2">
        <Button type="button" variant="ghost" size="icon">
          <PaperclipIcon />
        </Button>
        <Textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            emitTyping();
          }}
          placeholder="Type a message..."
          className="min-h-[2.5rem] max-h-32 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button type="submit" size="icon" onClick={sendMessage}>
          <SendIcon />
        </Button>
      </form>
    </div>
  </main>
</div>
```

### 9. Search & Discovery

```tsx
<div className="min-h-screen bg-background">
  {/* Search Header */}
  <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
    <div className="container py-4">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          className="pl-12 h-12 text-lg"
          placeholder="Search businesses, products, reviews..."
          autoFocus
        />
      </div>
      
      {/* Filters */}
      <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
        <Button variant="outline" size="sm" className="gap-1">
          <SlidersHorizontalIcon data-icon="inline-start" />
          Filters
        </Button>
        <Select value={distance} onValueChange={setDistance}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Distance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Within 1km</SelectItem>
            <SelectItem value="5">Within 5km</SelectItem>
            <SelectItem value="10">Within 10km</SelectItem>
            <SelectItem value="25">Within 25km</SelectItem>
          </SelectContent>
        </Select>
        <Select value={rating} onValueChange={setRating}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </header>
  
  {/* Results */}
  <main className="container py-6">
    <Tabs defaultValue="all">
      <TabsList className="w-full">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="businesses">Businesses</TabsTrigger>
        <TabsTrigger value="products">Products</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-6 space-y-8">
        {/* Businesses Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.map((biz) => (
              <BusinessCard key={biz.id} business={biz} compact />
            ))}
          </div>
        </section>
        
        {/* Products Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} compact />
            ))}
          </div>
        </section>
      </TabsContent>
      
      <TabsContent value="businesses">
        <Command empty="No businesses found" />
      </TabsContent>
      
      <TabsContent value="products">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="reviews">
        <div className="space-y-4">
          {reviews.map((review) => (
            <POVCard key={review.id} pov={review} compact />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  </main>
</div>
```

### 10. Cart & Checkout

```tsx
<div className="min-h-screen bg-muted/30">
  <header className="bg-background border-b">
    <div className="container py-4 flex items-center justify-between">
      <h1 className="text-2xl font-display font-bold">Your Cart</h1>
      <Badge variant="secondary">{cartItems.length} items</Badge>
    </div>
  </header>
  
  <main className="container py-6">
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {cartItems.length === 0 ? (
          <Empty
            title="Your cart is empty"
            description="Start shopping to add items to your cart."
            icon={ShoppingCartIcon}
            action={
              <Button onClick={() => router.push('/feed')}>
                Browse Feed
              </Button>
            }
          />
        ) : (
          cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex gap-4">
                <img
                  src={item.product.images[0]}
                  className="size-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.product.business.name}</p>
                  <p className="text-lg font-bold mt-2">
                    KES {item.product.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Select
                    value={item.quantity.toString()}
                    onValueChange={(val) => updateQuantity(item.id, parseInt(val))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <TrashIcon data-icon="inline-start" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform fee</span>
                <span>KES {platformFee.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>KES {total.toLocaleString()}</span>
              </div>
            </div>
            
            <Button className="w-full" size="lg" onClick={placeOrder}>
              <ShoppingBagIcon data-icon="inline-start" />
              Place Order
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Payment will be coordinated with the business via in-app messaging
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </main>
</div>
```

### 11. Dashboards

**Customer Dashboard**
```tsx
<div className="min-h-screen bg-muted/30">
  <header className="bg-background border-b">
    <div className="container py-6">
      <h1 className="text-3xl font-display font-bold">Welcome back, {user.firstName}</h1>
    </div>
  </header>
  
  <main className="container py-6 space-y-8">
    {/* Quick Stats */}
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <PackageIcon className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.orders}</p>
              <p className="text-sm text-muted-foreground">Orders</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <StarIcon className="size-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.reviews}</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-teal-500/10 flex items-center justify-center">
              <HeartIcon className="size-6 text-teal-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.following}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <MessageCircleIcon className="size-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.unreadMessages}</p>
              <p className="text-sm text-muted-foreground">Messages</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
    
    {/* Recent Orders */}
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Orders</h2>
        <Button variant="ghost" onClick={() => router.push('/orders')}>
          View all
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                  <TableCell>{order.business.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    KES {order.totalAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  </main>
</div>
```

**Business Owner Dashboard**
```tsx
// Similar structure with business-specific metrics:
// - Total Orders
// - Revenue
// - Pending Orders
// - Active POVs
// - Low Stock Alerts
// - Recent Activity
```

---

## Responsive Behavior

### Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640px - 1024px | 2 columns, sidebar collapsed |
| Desktop | > 1024px | 3 columns, full sidebar |

### Mobile Considerations

- Bottom navigation bar for primary actions
- Sheet/Drawer for secondary panels
- Full-screen modals for forms
- Touch-friendly targets (min 44px)
- Thumb-zone optimization for actions

### Container Sizes

```css
/* Mobile: Full width with padding */
container: "w-full px-4"

/* Tablet: Max 640px */
container-sm: "max-w-screen-sm mx-auto px-4"

/* Desktop: Max 1280px */
container-md: "max-w-screen-md mx-auto px-4"

/* Large: Max 1536px */
container-lg: "max-w-screen-lg mx-auto px-4"
```

---

## Accessibility

- All interactive elements have focus-visible states
- Color contrast meets WCAG 2.1 AA
- Keyboard navigation for all features
- Screen reader announcements for dynamic content
- Reduced motion preference respected
- Form labels properly associated with inputs

---

## Animation Specifications

### Entrance Animations
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

### Hover States
```css
.card-hover {
  @apply transition-all duration-200;
}

.card-hover:hover {
  @apply scale-[1.02] shadow-lg;
}
```

### Loading States
```tsx
<Skeleton className="h-4 w-full animate-pulse" />
<Skeleton className="size-10 rounded-full animate-pulse" />
```

---

## Iconography

Using **Lucide React** icons consistently:

| Action | Icon |
|--------|------|
| Navigation | HomeIcon, SearchIcon, BellIcon, UserIcon, SettingsIcon |
| Commerce | ShoppingCartIcon, ShoppingBagIcon, PackageIcon, StoreIcon |
| Social | HeartIcon, MessageCircleIcon, ShareIcon, UsersIcon, StarIcon |
| Actions | PlusIcon, EditIcon, TrashIcon, CheckIcon, XIcon, ArrowRightIcon |
| Media | CameraIcon, VideoIcon, ImageIcon, PlayIcon |
| Status | CheckCircleIcon, AlertCircleIcon, ClockIcon, TrendingUpIcon |

---

## Component Status

| Component | Status | Priority |
|-----------|--------|----------|
| Button | Implement | P0 |
| Card (POV, Business, Product) | Implement | P0 |
| Input / Textarea | Implement | P0 |
| Avatar | Implement | P0 |
| Badge | Implement | P0 |
| Dialog | Implement | P0 |
| Tabs | Implement | P0 |
| Select | Implement | P0 |
| DropdownMenu | Implement | P0 |
| Sheet | Implement | P0 |
| Navigation (Header, Sidebar) | Implement | P0 |
| Onboarding Modal | Implement | P1 |
| Feed | Implement | P1 |
| Business Profile | Implement | P1 |
| Product Shelf | Implement | P1 |
| Messaging | Implement | P2 |
| Search | Implement | P2 |
| Cart | Implement | P2 |
| Dashboards | Implement | P2 |

---

## Files Structure

```
frontend/src/
├── components/
│   ├── ui/                    # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx        # Main navigation
│   │   ├── MobileNav.tsx     # Bottom navigation (mobile)
│   │   └── Sidebar.tsx      # Dashboard sidebar
│   ├── feed/
│   │   ├── POVCard.tsx
│   │   ├── FeedGrid.tsx
│   │   └── FeedFilters.tsx
│   ├── business/
│   │   ├── BusinessCard.tsx
│   │   ├── BusinessProfile.tsx
│   │   └── ProductCard.tsx
│   ├── messaging/
│   │   ├── ConversationList.tsx
│   │   ├── ChatThread.tsx
│   │   └── MessageBubble.tsx
│   ├── onboarding/
│   │   ├── CustomerOnboarding.tsx
│   │   ├── BusinessOnboarding.tsx
│   │   └── InterestPicker.tsx
│   └── shared/
│       ├── Rating.tsx
│       ├── MediaThumbnail.tsx
│       └── StatusBadge.tsx
├── pages/
│   ├── Home.tsx              # Landing page
│   ├── feed/
│   │   └── Feed.tsx
│   ├── business/
│   │   ├── [slug].tsx       # Business profile
│   │   └── products/
│   │       └── [productId].tsx
│   ├── search/
│   │   └── Search.tsx
│   ├── messages/
│   │   └── Messages.tsx
│   ├── cart/
│   │   └── Cart.tsx
│   └── dashboard/
│       ├── CustomerDashboard.tsx
│       └── BusinessDashboard.tsx
└── styles/
    └── buzzmap.css           # BuzzMap-specific styles
```

---

**© 2026 Matthew Makundi, Founder [SpookieLabsInc](https://www.spookielabsinc.site)**
