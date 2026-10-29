# Every post gets a header image. A post can set its own in front matter:
#
#   image: /assets/img/my-post/cover.png
#   image_dark: /assets/img/my-post/cover-dark.png  (optional)
#   image_alt: "What the image shows"
#
# Posts without one use the branded title cards that scripts/generate-cards.mjs
# writes to assets/cards/ (a light and a dark version). `image` is also what
# jekyll-seo-tag uses for og:image / twitter:image, so link previews get it;
# when there's a dark version, link previews use that one.
Jekyll::Hooks.register :site, :post_read do |site|
  site.posts.docs.each do |post|
    if post.data["image_dark"]
      post.data["header_card"] = { "light" => post.data["image"], "dark" => post.data["image_dark"] }
      post.data["image"] = post.data["image_dark"]
      next
    end
    next if post.data["image"]

    card = "/assets/cards/#{post.basename_without_ext}"
    post.data["header_card"] = { "light" => "#{card}-light.png", "dark" => "#{card}-dark.png" }
    post.data["image"] = "#{card}-dark.png"
  end
end
