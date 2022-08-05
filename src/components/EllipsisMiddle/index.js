import { Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

const EllipsisMiddle = ({
    suffixCount,
    children,
}) => {
    const start = children.slice(0, children.length - suffixCount).trim();
    const suffix = children.slice(-suffixCount).trim();

    return (
        <Text style={{ maxWidth: '100px' }} ellipsis={{ suffix }}>
            { start }
        </Text>
    );
};

export default EllipsisMiddle;
