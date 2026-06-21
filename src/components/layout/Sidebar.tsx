import { PlaceholderButton } from "../ui/PlaceholderButton";

const navItems = ["Dashboard", "Vault Graph", "Sources", "Models", "Activity", "Settings"];
const controlItems = ["Add Source", "Edit Source", "Enable Source", "Disable Source"];
const categoryItems = ["LLM", "Code", "Image", "Music", "Video", "Audio", "Research", "Local", "Manual", "Unknown"];

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar__section">
        <span className="sidebar__label">Workspace</span>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button className={item === "Dashboard" ? "sidebar__item sidebar__item--active" : "sidebar__item"} key={item} type="button">
              {item}
            </button>
          ))}
        </nav>
      </div>
      <div className="sidebar__section">
        <span className="sidebar__label">Categories</span>
        <div className="sidebar__chips">
          {categoryItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="sidebar__section">
        <span className="sidebar__label">Registry Controls</span>
        <div className="sidebar__controls">
          {controlItems.map((item) => (
            <PlaceholderButton key={item}>{item}</PlaceholderButton>
          ))}
        </div>
      </div>
      <div className="sidebar__section sidebar__section--bottom">
        <span className="sidebar__label">Future Tools</span>
        <PlaceholderButton>Import / Export</PlaceholderButton>
      </div>
    </aside>
  );
}
