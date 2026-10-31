<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Storefront data (products, cart, orders) lives in src/lib/store.tsx backed by localStorage; swap its internals for the database later so pages stay unchanged.
- Sample catalog lives in src/data/products.ts and must stay labelled as sample data until real data is connected.
