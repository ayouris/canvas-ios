//
// Copyright (C) 2018-present Instructure, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, version 3 of the License.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

import Foundation

public class GetContextTabs: CollectionUseCase {
    public typealias Model = Tab
    public let context: Context

    public init(context: Context) {
        self.context = context
    }

    public var cacheKey: String {
        return "get-\(context.canvasContextID)-tabs"
    }

    public var request: GetTabsRequest {
        return GetTabsRequest(context: context)
    }

    public var scope: Scope {
        let sort = NSSortDescriptor(key: #keyPath(Tab.position), ascending: true)
        let pred = NSPredicate(format: "%K == %@", #keyPath(Tab.contextRaw), context.canvasContextID)
        return Scope(predicate: pred, order: [sort])
    }

    public func write(response: [APITab]?, urlResponse: URLResponse?, to client: PersistenceClient) throws {
        guard let response = response else {
            return
        }

        for item in response {
            let predicate = NSPredicate(format: "%K == %@", #keyPath(Tab.htmlURL), item.html_url as CVarArg)
            let model: Tab = client.fetch(predicate).first ?? client.insert()
            try model.save(item, in: client, context: context)
        }
    }
}
