# Every post gets a header image. A post can set its own in front matter:
#
#   image: /assets/img/my-post/cover.png
#   image_alt: "What the image shows"
#
# Posts without one use the branded title cards that scripts/generate-cards.mjs
# writes to assets/cards/ (a light and a dark version). `image` is also what
# jekyll-seo-tag uses for og:image / twitter:image, so link previews get it.
Jekyll::Hooks.register :site, :post_read do |site|
  site.posts.docs.each do |post|
    next if post.data["image"]

    card = "/assets/cards/#{post.basename_without_ext}"
    post.data["header_card"] = { "light" => "#{card}-light.png", "dark" => "#{card}-dark.png" }
    post.data["image"] = "#{card}-dark.png"
  end
end
