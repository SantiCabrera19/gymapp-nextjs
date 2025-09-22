export function Footer() {
  return (
    <footer className="mt-8 border-t border-border-primary/80 py-3 text-sm text-text-tertiary">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 flex items-center justify-between">
        <p>© {new Date().getFullYear()} GymApp — All rights reserved</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-text-secondary">Privacidad</a>
          <a href="#" className="hover:text-text-secondary">Términos</a>
          <a href="#" className="hover:text-text-secondary">Contacto</a>
        </div>
      </div>
    </footer>
  )
}
