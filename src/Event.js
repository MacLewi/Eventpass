// models/Event.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Speaker Sub-schema
const speakerSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Speaker name is required'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Speaker role is required'],
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    photo: String,
    bio: String
}, { _id: true });

// Artist Sub-schema (for music events)
const artistSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Artist name is required'],
        trim: true
    },
    stage: {
        type: String,
        trim: true
    },
    time: String,
    duration: String,
    genre: [String]
}, { _id: true });

// Workshop Sub-schema
const workshopSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Workshop title is required'],
        trim: true
    },
    speaker: {
        type: String,
        required: [true, 'Speaker name is required'],
        trim: true
    },
    time: String,
    duration: String,
    capacity: Number,
    room: String
}, { _id: true });

// Auction Item Sub-schema
const auctionItemSchema = new Schema({
    item: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    value: {
        type: Number,
        min: 0
    },
    donated_by: String,
    starting_bid: Number,
    current_bid: Number
}, { _id: true });

// Module Sub-schema (for educational events)
const moduleSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Module title is required'],
        trim: true
    },
    duration: String,
    instructor: {
        type: String,
        required: true
    },
    description: String,
    resources: [String]
}, { _id: true });

// Attendee Sub-schema
const attendeeSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    ticket_type: {
        type: String,
        enum: ['regular', 'vip', 'student', 'sponsor'],
        default: 'regular'
    },
    registration_date: {
        type: Date,
        default: Date.now
    },
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    check_in_status: {
        type: Boolean,
        default: false
    },
    special_requirements: String
}, { _id: true });

// Location Schema
const locationSchema = new Schema({
    venue: {
        type: String,
        required: [true, 'Venue name is required'],
        trim: true
    },
    address: {
        type: String,
        required: function () {
            return !this.location?.is_virtual;
        },
        trim: true
    },
    city: {
        type: String,
        required: function () {
            return !this.location?.is_virtual;
        },
        trim: true
    },
    state: String,
    country: {
        type: String,
        required: function () {
            return !this.location?.is_virtual;
        },
        trim: true
    },
    zip_code: String,
    platform: {
        type: String,
        required: function () {
            return this.location?.is_virtual === true;
        }
    },
    meeting_link: {
        type: String,
        required: function () {
            return this.location?.is_virtual === true;
        }
    },
    is_virtual: {
        type: Boolean,
        default: false
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        }
    }
}, { _id: false });

// Organizer Schema
const organizerSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Organizer name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Organizer email is required'],
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Organizer phone is required'],
        match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Please enter a valid phone number']
    },
    website: {
        type: String,
    },
    description: String,
    logo: String,
    social_media: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    }
}, { _id: false });

// Main Event Schema
const eventSchema = new Schema({
    event_id: {
        type: String,
        required: [true, 'Event ID is required'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    name: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true,
        maxlength: [200, 'Event name cannot exceed 200 characters'],
        index: true
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Event category is required'],
        enum: {
            values: ['technology', 'music', 'business', 'charity', 'art', 'education', 'sports', 'health', 'other'],
            message: '{VALUE} is not a valid category'
        },
        index: true
    },
    sub_category: [String],
    start_date: {
        type: Date,
        required: [true, 'Start date is required'],
        index: true
    },
    end_date: {
        type: Date,
        required: [true, 'End date is required'],
    },
    location: locationSchema,
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1'],
        max: [100000, 'Capacity cannot exceed 100,000']
    },
    ticket_price: {
        type: Number,
        required: function () {
            return !this.is_free;
        },
        min: [0, 'Ticket price cannot be negative']
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true,
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR']
    },
    status: {
        type: String,
        required: true,
        enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'],
        default: 'draft',
        index: true
    },
    organizer: organizerSchema,

    // Dynamic fields based on category
    speakers: [speakerSchema],
    artists: [artistSchema],
    workshops: [workshopSchema],
    auction_items: [auctionItemSchema],
    modules: [moduleSchema],

    attendees: [attendeeSchema],
    tags: {
        type: [String],
        index: true,
    },
    is_free: {
        type: Boolean,
        default: false
    },
    is_virtual: {
        type: Boolean,
        default: false
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    banner_image: String,
    gallery_images: [String],

    // Statistics
    total_attendees: {
        type: Number,
        default: 0,
        min: 0
    },
    total_revenue: {
        type: Number,
        default: 0,
        min: 0
    },
    average_rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    total_reviews: {
        type: Number,
        default: 0
    },

    // Social engagement
    views_count: {
        type: Number,
        default: 0
    },
    likes_count: {
        type: Number,
        default: 0
    },
    shares_count: {
        type: Number,
        default: 0
    },

    // Timestamps
    created_at: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    published_at: Date,
    cancelled_at: Date
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
eventSchema.index({ name: 'text', description: 'text', tags: 'text' });
eventSchema.index({ 'location.coordinates': '2dsphere' });
eventSchema.index({ status: 1, start_date: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ is_free: 1, is_virtual: 1 });
eventSchema.index({ start_date: 1, end_date: 1 });

// Virtual fields
eventSchema.virtual('duration_hours').get(function () {
    if (!this.start_date || !this.end_date) return null;
    const duration = this.end_date - this.start_date;
    return duration / (1000 * 60 * 60);
});

eventSchema.virtual('available_seats').get(function () {
    return Math.max(0, this.capacity - this.total_attendees);
});

eventSchema.virtual('is_full').get(function () {
    return this.total_attendees >= this.capacity;
});

// Middleware
eventSchema.pre('save', function (next) {
    // Update status based on dates
    const now = new Date();
    if (this.status !== 'cancelled' && this.status !== 'postponed') {
        if (now < this.start_date) {
            this.status = 'upcoming';
        } else if (now >= this.start_date && now <= this.end_date) {
            this.status = 'ongoing';
        } else if (now > this.end_date) {
            this.status = 'completed';
        }
    }

    // Set is_free flag based on ticket price
    if (this.ticket_price === 0) {
        this.is_free = true;
    }

    // Update total_attendees count
    this.total_attendees = this.attendees.length;

    // Auto-generate event_id if not provided
    if (!this.event_id) {
        const year = this.start_date.getFullYear();
        const categoryCode = this.category.substring(0, 4).toUpperCase();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.event_id = `EVT-${categoryCode}-${year}-${random}`;
    }

    next();
});

eventSchema.statics.getAllEvents = async function () {
    try {
        console.log("HEHEHEHE");

        const events = await this.find({}).sort({ start_date: 1 });
        return events;
    } catch (error) {
        throw new Error(`Error fetching events: ${error.message}`);
    }
};

eventSchema.pre('updateOne', function (next) {
    this.set({ updated_at: new Date() });
    next();
});

// Instance methods
eventSchema.methods.registerAttendee = async function (userId, userData, ticketType = 'regular') {
    // Check if event is full
    if (this.is_full) {
        throw new Error('Event is full');
    }

    // Check if user already registered
    const alreadyRegistered = this.attendees.some(
        attendee => attendee.user_id.toString() === userId.toString()
    );

    if (alreadyRegistered) {
        throw new Error('User already registered for this event');
    }

    // Add attendee
    this.attendees.push({
        user_id: userId,
        name: userData.name,
        email: userData.email,
        ticket_type: ticketType,
        registration_date: new Date()
    });

    this.total_attendees = this.attendees.length;

    // Calculate revenue
    if (!this.is_free && ticketType === 'regular') {
        this.total_revenue += this.ticket_price;
    } else if (ticketType === 'vip') {
        this.total_revenue += this.ticket_price * 2;
    }

    await this.save();
    return this;
};

eventSchema.methods.cancelRegistration = async function (userId) {
    const attendeeIndex = this.attendees.findIndex(
        attendee => attendee.user_id.toString() === userId.toString()
    );

    if (attendeeIndex === -1) {
        throw new Error('Attendee not found');
    }

    // Remove attendee
    const removedAttendee = this.attendees.splice(attendeeIndex, 1)[0];
    this.total_attendees = this.attendees.length;

    // Adjust revenue
    if (removedAttendee.payment_status === 'completed') {
        let refundAmount = this.ticket_price;
        if (removedAttendee.ticket_type === 'vip') {
            refundAmount *= 2;
        }
        this.total_revenue -= refundAmount;
    }

    await this.save();
    return this;
};

eventSchema.methods.checkInAttendee = async function (userId) {
    const attendee = this.attendees.find(
        attendee => attendee.user_id.toString() === userId.toString()
    );

    if (!attendee) {
        throw new Error('Attendee not found');
    }

    attendee.check_in_status = true;
    await this.save();
    return attendee;
};

eventSchema.methods.updateRating = async function (newRating) {
    const total = (this.average_rating * this.total_reviews) + newRating;
    this.total_reviews += 1;
    this.average_rating = total / this.total_reviews;
    await this.save();
    return this.average_rating;
};

// Static methods
eventSchema.statics.findUpcoming = function (limit = 10) {
    return this.find({
        status: 'upcoming',
        start_date: { $gt: new Date() }
    })
        .sort({ start_date: 1 })
        .limit(limit);
};

eventSchema.statics.findByCategory = function (category, limit = 20) {
    return this.find({ category, status: 'upcoming' })
        .sort({ start_date: 1 })
        .limit(limit);
};

eventSchema.statics.searchEvents = function (searchTerm, filters = {}) {
    const query = {
        $text: { $search: searchTerm },
        status: { $ne: 'cancelled' }
    };

    if (filters.category) query.category = filters.category;
    if (filters.is_free !== undefined) query.is_free = filters.is_free;
    if (filters.is_virtual !== undefined) query.is_virtual = filters.is_virtual;
    if (filters.start_date) query.start_date = { $gte: filters.start_date };
    if (filters.end_date) query.end_date = { $lte: filters.end_date };

    return this.find(query)
        .sort({ start_date: 1 })
        .limit(filters.limit || 50);
};

eventSchema.statics.findNearby = function (lng, lat, maxDistance = 10000) {
    return this.find({
        'location.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: maxDistance
            }
        },
        status: 'upcoming',
        is_virtual: false
    });
};

const Event = mongoose.model('Event', eventSchema, 'Event');
module.exports = Event;