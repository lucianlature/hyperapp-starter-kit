import { h } from 'hyperapp';

export default ({ items }) =>
    <div>
    {items.map(item => (
        <Item
            key={item.id}
            item={item}
            itemClicked={this.handleItemClicked}
        />
    ))}
    </div>;
