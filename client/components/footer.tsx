export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-foreground">
              Created by <span className="text-primary font-bold">Yug Patel</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Inspired From: <span className="font-medium">Jagdish Patel</span>
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs text-muted-foreground">
              Mail:{" "}
              <a href="mailto:yjpatel1275@gmail.com" className="text-primary hover:underline font-medium">
                yjpatel1275@gmail.com
              </a>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              © {new Date().getFullYear()} SiteCraft. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
