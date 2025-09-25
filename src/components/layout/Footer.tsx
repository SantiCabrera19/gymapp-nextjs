export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-primary/80 py-6 text-sm text-text-tertiary bg-background-secondary/30">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 flex items-center justify-between">
        <p>© {new Date().getFullYear()} GymApp — All rights reserved</p>
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            className="hover:text-text-secondary transition-colors duration-200 hover:scale-105 active:scale-95"
          >
            Privacidad
          </a>
          <a 
            href="#" 
            className="hover:text-text-secondary transition-colors duration-200 hover:scale-105 active:scale-95"
          >
            Términos
          </a>
          <a 
            href="#" 
            className="hover:text-text-secondary transition-colors duration-200 hover:scale-105 active:scale-95"
          >
            Contacto
          </a>
        </div>
      </div>
    </footer>
  )
}
