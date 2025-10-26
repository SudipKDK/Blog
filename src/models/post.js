import mongoose, { Schema } from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    coverImageURL: {
      type: String,
      default: null
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    published: {
      type: Boolean,
      default: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    viewCount: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }   
);

// Virtual for excerpt
postSchema.virtual('excerpt').get(function() {
  return this.body.length > 150 ? this.body.substring(0, 150) + '...' : this.body;
});

// Index for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ published: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: 'text', body: 'text' }); // Text search index
postSchema.index({ viewCount: -1 }); // Popular posts

const Post = mongoose.model("Post", postSchema);
export default Post;
