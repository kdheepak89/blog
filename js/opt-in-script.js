/*! opt-in-script 0.1.0 | https://github.com/dancek/opt-in-script
 *  @license Copyright Hannu Hartikainen 2020 | MIT License */
document.querySelectorAll("opt-in-script").forEach(ois =>
  (ois.querySelector("button") || ois).addEventListener("click", _ => {
    let commentheader = document.createElement("h1");
    commentheader.id = "comments";
    commentheader.innerHTML = '<a href="#comments">#</a> Comments';
    let script = document.createElement("script")
    Array.from(ois.attributes).forEach(attr =>
      script.setAttribute(attr.name, attr.value))
    ois.parentNode.prepend(commentheader)
    ois.parentNode.replaceChild(script, ois)
  })
)
